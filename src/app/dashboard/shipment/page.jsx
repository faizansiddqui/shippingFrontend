"use client";
import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "@/utils/api";
import { Search, RefreshCw } from "lucide-react";

const ShipmentPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    dateFrom: "",
    dateTo: "",
    paymentMethod: "",
    courier: "",
  });
  const [selectedOrderIds, setSelectedOrderIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/user-orders`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data?.status) {
        throw new Error(data?.error || "Failed to fetch orders");
      }
      setOrders(data.data || []);
      setFilteredOrders(data.data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const scheduledOrders = orders.filter((o) => o.selectedCourierName);

  useEffect(() => {
    let filtered = scheduledOrders;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          String(o.orderId || "").toLowerCase().includes(q) ||
          String(o.selectedCourierName || "").toLowerCase().includes(q),
      );
    }
    if (filters.dateFrom) {
      filtered = filtered.filter((o) => new Date(o.orderDate) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      filtered = filtered.filter((o) => new Date(o.orderDate) <= new Date(filters.dateTo));
    }
    if (filters.paymentMethod) {
      filtered = filtered.filter((o) => o.paymentMethod === filters.paymentMethod);
    }
    if (filters.courier) {
      filtered = filtered.filter((o) => o.selectedCourierName === filters.courier);
    }
    setFilteredOrders(filtered);
  }, [filters, orders]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSelectAllVisible = () => {
    const allIds = filteredOrders.map((o) => o.orderId).filter(Boolean);
    const allSelected = allIds.length > 0 && allIds.every((id) => selectedOrderIds.has(id));
    const next = new Set(selectedOrderIds);
    if (allSelected) {
      allIds.forEach((id) => next.delete(id));
    } else {
      allIds.forEach((id) => next.add(id));
    }
    setSelectedOrderIds(next);
  };

  const toggleSelectOne = (orderId) => {
    if (!orderId) return;
    const next = new Set(selectedOrderIds);
    if (next.has(orderId)) next.delete(orderId);
    else next.add(orderId);
    setSelectedOrderIds(next);
  };

  const courierOptions = Array.from(
    new Set(scheduledOrders.map((o) => o.selectedCourierName).filter(Boolean)),
  );

  return (
    <div className="max-w-6xl text-black mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Shipments ({filteredOrders.length})</h2>
        <button
          onClick={fetchOrders}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <span className="inline-flex items-center gap-2">
            <RefreshCw size={16} />
            Refresh
          </span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 rounded-xl p-4 mb-6">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-5 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium mb-1">Search</label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Order ID / Courier"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">From Date</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">To Date</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange("dateTo", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Courier</label>
          <select
            value={filters.courier}
            onChange={(e) => handleFilterChange("courier", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">All</option>
            {courierOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Payment</label>
          <select
            value={filters.paymentMethod}
            onChange={(e) => handleFilterChange("paymentMethod", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">All</option>
            <option value="PREPAID">Prepaid</option>
            <option value="COD">COD</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Loading...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-sm text-gray-500">No scheduled shipments yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                {/* <th className="border p-3 text-left text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={
                      filteredOrders.length > 0 &&
                      filteredOrders.every((o) => selectedOrderIds.has(o.orderId))
                    }
                    onChange={toggleSelectAllVisible}
                  />
                </th> */}
                <th className="border p-3 text-left text-sm font-medium">Order ID</th>
                <th className="border p-3 text-left text-sm font-medium">Date</th>
                <th className="border p-3 text-left text-sm font-medium">Courier</th>
                <th className="border p-3 text-left text-sm font-medium">Freight</th>
                <th className="border p-3 text-left text-sm font-medium">Payment</th>
                <th className="border p-3 text-right text-sm font-medium">Charge (₹)</th>
                <th className="border p-3 text-right text-sm font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => (
                <tr key={o.orderId} className="border-b">
                  {/* <td className="p-3 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedOrderIds.has(o.orderId)}
                      onChange={() => toggleSelectOne(o.orderId)}
                    />
                  </td> */}
                  <td className="p-3 text-sm font-medium">{o.orderId}</td>
                  <td className="p-3 text-sm">
                    {o.orderDate ? new Date(o.orderDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="p-3 text-sm">{o.selectedCourierName}</td>
                  <td className="p-3 text-sm">{o.selectedFreightMode || "—"}</td>
                  <td className="p-3 text-sm">{o.paymentMethod || "PENDING"}</td>
                  <td className="p-3 text-right text-sm">
                    ₹{Number(o.selectShippingCharges || 0).toFixed(2)}
                  </td>
                  <td className="p-3 text-right text-sm">
                    <button
                      onClick={() => handleApproveOne(o.orderId)}
                      className="text-emerald-600 cursor-pointer hover:text-emerald-800 p-1"
                      title="Approve Order"
                    >
                      Ship Now
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ShipmentPage;
