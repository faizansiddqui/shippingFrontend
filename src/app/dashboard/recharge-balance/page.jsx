"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../../utils/checkAuth";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, DownArrow, RefreshCw } from "lucide-react"; // Import the down arrow icon

export default function RechargeBalancePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Wallet data
  const [walletBalance, setWalletBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true); // Only first load spinner

  // Transaction history
  const [transactions, setTransactions] = useState([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [totalDebits, setTotalDebits] = useState(0);
  const [netFromHistory, setNetFromHistory] = useState(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const totalPages = Math.ceil(transactions.length / rowsPerPage);
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  // Fetch Balance
  async function fetchBalance() {
    if (initialLoad) setBalanceLoading(true); // Spinner only on first load

    try {
      const res = await fetch("/api/wallet/balance", {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setWalletBalance(Number(data.wallet_balance ?? 0));
      } else {
        console.error("fetchBalance failed:", res.status);
        setWalletBalance(0);
      }
    } catch (err) {
      console.error("fetchBalance error:", err);
      setWalletBalance(0);
    } finally {
      if (initialLoad) setBalanceLoading(false);
    }
  }

  // Fetch History
  async function fetchHistory() {
    try {
      const res = await fetch("/api/wallet/history", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        console.error("fetchHistory failed:", res.status);
        return;
      }

      const data = await res.json();
      const txs = Array.isArray(data.transactions) ? data.transactions : [];

      const parsedTxs = txs.map((tx) => ({
        ...tx,
        amount: Number(tx.amount ?? 0),
        type: tx.type ? String(tx.type).toLowerCase() : undefined,
      }));

      const largePaiseCount = parsedTxs.reduce(
        (c, t) => c + (Math.abs(t.amount) >= 10000 ? 1 : 0),
        0,
      );
      const assumePaise =
        parsedTxs.length > 0 && largePaiseCount > parsedTxs.length / 2;

      const finalTxs = parsedTxs.map((t) => ({
        ...t,
        amount: assumePaise ? t.amount / 100 : t.amount,
      }));

      let credits = 0,
        debits = 0;
      finalTxs.forEach((tx) => {
        const amt = Number(tx.amount || 0);
        if (tx.type === "debit" || amt < 0) debits += Math.abs(amt);
        else credits += amt;
      });

      const net = credits - debits;

      setTransactions(finalTxs);
      setTotalCredits(credits);
      setTotalDebits(debits);
      setNetFromHistory(net);
      setCurrentPage(1);
    } catch (err) {
      console.error("fetchHistory error:", err);
    }
  }

  // Pagination Handlers
  const handlePageChange = (page) => setCurrentPage(page);
  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Load data only when user.id changes (stable)
  useEffect(() => {
    if (!user?.id) return;

    const loadData = async () => {
      await Promise.all([fetchBalance(), fetchHistory()]);
      setInitialLoad(false); // First load done
    };

    loadData();
  }, [user?.id]); // Stable dependency

  // Manual Refresh (with spinner)
  const handleManualRefresh = async () => {
    setBalanceLoading(true);
    await Promise.all([fetchBalance(), fetchHistory()]);
    setBalanceLoading(false);
  };

  // Razorpay Script Loader
  const loadRazorpayScript = () =>
    new Promise((resolve, reject) => {
      if (window.Razorpay) return resolve();
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Razorpay SDK failed"));
      document.body.appendChild(script);
    });

  // Handle Payment
  const handlePayment = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return alert("Enter valid amount");
    if (!user) return router.push("/login");

    setSubmitting(true);
    try {
      const createRes = await fetch("/api/create-razor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount: Number(amount) }),
      });

      if (!createRes.ok) throw new Error("Order failed");

      const order = await createRes.json();
      if (!order?.id) throw new Error("No order ID");

      await loadRazorpayScript();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Faizan Wallet",
        description: "Recharge Balance",
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                amount: Number(amount),
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              await fetchBalance();
              await fetchHistory();
              alert(
                `Wallet updated! New balance: ₹${verifyData.wallet_balance}`,
              );
            } else {
              alert(
                "Payment failed: " + (verifyData.message || "Unknown error"),
              );
            }
          } catch (err) {
            console.error(err);
            alert("Verification error");
          } finally {
            setSubmitting(false);
          }
        },
        prefill: {
          name: user.email.split("@")[0] || "User",
          email: user.email,
          contact: "9999999999",
        },
        theme: { color: "#0d6efd" },
      };

      const rzr = new window.Razorpay(options);
      rzr.open();
    } catch (err) {
      console.error(err);
      alert("Payment setup failed");
      setSubmitting(false);
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen text-black bg-gradient-to-br from-purple-50 via-white to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Wallet</h1>
          <span className="md:block text-gray-700 font-medium">
            {user?.name || user?.email?.split("@")[0] || "User"}
          </span>
          <p className="text-gray-600">Manage your balance with ease</p>
        </div>

        {/* Balance Card */}
        <div className="bg-white rounded-2xl p-6 mb-6 border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Current Balance
              </p>
              <p className="text-3xl font-bold text-purple-700">
                {balanceLoading && initialLoad ? (
                  <span className="animate-pulse">Loading...</span>
                ) : (
                  `₹${walletBalance}`
                )}
                {balanceLoading && !initialLoad && (
                  <span className="ml-2 animate-spin inline-block w-4 h-4 border-b-2 border-purple-600 rounded-full"></span>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">User: {user.email}</p>
            </div>
            <div className="text-right">
              <button
                onClick={handleManualRefresh}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer transition-colors disabled:opacity-50"
              >
                <RefreshCw size={20}/>
                Refresh
              </button>
              <div
                className={`mt-1 px-3 py-1 text-center rounded-full text-xs font-semibold ${
                  walletBalance > 0
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {walletBalance > 0 ? "Active" : "Empty"}
              </div>
            </div>
          </div>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-green-100">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <span className="text-green-600 text-lg">
                  <ArrowUp />
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Credits
                </p>
                <p className="text-xl font-bold text-green-600">
                  ₹{totalCredits}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-red-100">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg mr-3">
                <span className="text-red-600 text-lg">
                  <ArrowDown />
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Debits
                </p>
                <p className="text-xl font-bold text-red-600">₹{totalDebits}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-blue-100">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <span className="text-blue-600 text-lg">Balance Scale</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Net Balance</p>
                <p
                  className={`text-xl font-bold ${netFromHistory >= 0 ? "text-blue-600" : "text-orange-600"}`}
                >
                  ₹{netFromHistory}
                </p>
              </div>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 text-center mb-6">
          Totals derived from transaction history. Server balance is
          authoritative.
        </p>

        {/* Recharge Form */}
        <div className="bg-white rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Recharge Your Wallet
          </h2>
          <form onSubmit={handlePayment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Amount (₹)
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={submitting}
                placeholder="Enter amount"
              />
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all"
              >
                {submitting ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2 w-4 h-4 border-b-2 border-white rounded-full"></span>
                    Processing...
                  </span>
                ) : (
                  "Recharge Now"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Transaction History
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <label>Rows per page:</label>
              <select
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
                className="border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-purple-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={transactions.length}>All</option>
              </select>
              <span>
                Page {currentPage} of {totalPages}
              </span>
            </div>
          </div>

          {paginatedTransactions.length > 0 ? (
            <div className="space-y-3">
              {paginatedTransactions.map((tx) => {
                const amt = Number(tx.amount ?? 0);
                const isDebit = tx.type === "debit" || amt < 0;
                const displayAmount = isDebit
                  ? `-₹${Math.abs(amt).toFixed(2)}`
                  : `+₹${amt.toFixed(2)}`;
                return (
                  <div
                    key={tx.id}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border-l-4 border-l-purple-500 hover:bg-gray-100"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        {tx.description || "Wallet transaction"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(tx.created_at).toLocaleString()}
                      </div>
                      {tx.payment_id && (
                        <div className="text-xs text-purple-600 mt-1">
                          ID: {tx.payment_id.slice(-8)}
                        </div>
                      )}
                    </div>
                    <div
                      className={`text-right font-bold text-lg ${isDebit ? "text-red-600" : "text-green-600"}`}
                    >
                      {displayAmount}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">No transactions yet.</p>
              <p className="mt-2">Recharge to start!</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-100"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      currentPage === page
                        ? "bg-purple-600 text-white"
                        : "border hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
