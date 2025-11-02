"use client"

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import { useWallet } from "@/context/WalletContext";

export default function AddNewOrder() {

  const [formData, setFormData] = useState({
    orderId: "",
    orderDate: new Date().toISOString().split("T")[0],
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    pinCode: "",
    packageLength: 0,
    packageBreadth: 0,
    packageHeight: 0,
    weightGram: 0,
    itemName: "",
    sku: "",
    description: "",
    units: 1,
    unitPrice: 0,
    tax: 0,
    hsn: "",
    pickupAddressName: "",
    paymentMethod: "PREPAID",
    totalOrderValue: 0,
    shippingCharges: 0,
    codCharges: 0,
    selectShippingCharges: 0,
    selectedCourierName: "", 
    selectedFreightMode: ""   
  });

  const { walletBalance } = useWallet(); // Assuming the context provides only balance; we'll handle deduction via API

  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showShippingModal, setShowShippingModal] = useState(false); // New: State for custom popup/modal
  const [pickupAddresses, setPickupAddresses] = useState([]);
  const [pickupPincode, setPickupPincode] = useState("");  
  const [calculatedShipping, setCalculatedShipping] = useState(null);
  const [shippingError, setShippingError] = useState("");

  // yaha par form ke input value chageho rahi hian on event on change ok
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "number" ? (value === "" ? "" : Number(value)) : value }));
  };

  // Find all Pickup Address by user unique id
  useEffect(() => {
    const fetchPickupAddresses = async () => {
      try {
        const res = await fetch('http://localhost:5000/fetchAllPickupAddress', {
          method: 'GET',
          credentials: 'include' // <- MUST for httpOnly cookies
        });
        const data = await res.json();
        if (res.ok && data.status) {
          setPickupAddresses(data.data);
        } else {
          console.error("Failed to fetch pickup addresses:", data.message || data);
        }
      } catch (err) {
        console.error("Error fetching pickup addresses:", err);
      }
    };
    fetchPickupAddresses();
  }, []);

  // 🔹 Pickup address ke dvara yaha par pincode fetch ho rha hai 
  const handlePickupSelect = async (e) => {
    const value = e.target.value;

    // update formData to keep compatibility with your submit
    setFormData((prev) => ({
      ...prev,
      pickupAddressName: value,
    }));

    setPickupPincode(""); // reset previous

    if (!value.trim()) return;

    const url = `http://localhost:5000/fetchPickupLocationPicode?addressName=${encodeURIComponent(value)}`;

    try {
      // 1) first attempt — include cookies
      let res = await fetch(url, { method: 'GET', credentials: 'include' });

      // 2) if unauthorized, try refresh endpoint once (also include cookies)
      if (res.status === 401) {
        console.warn('Got 401 — attempting token refresh...');
        const refreshRes = await fetch('http://localhost:5000/refresh', {
          method: 'POST',
          credentials: 'include'
        });

        if (refreshRes.ok) {
          console.log('Token refresh succeeded — retrying pincode fetch');
          res = await fetch(url, { method: 'GET', credentials: 'include' });
        } else {
          console.warn('Refresh failed:', await refreshRes.text());
        }
      }

      // 3) handle final response
      const data = await res.json().catch(() => null);

      if (res.ok && data && data.status) {
        setPickupPincode(data.data.pincode);
      } else if (res.status === 401) {
        // final unauthorized
        console.error('Unauthorized. Please login again.');
        setPickupPincode('Unauthorized — please login');
      } else {
        console.error('Failed to fetch pincode:', res.status, data);
        setPickupPincode('Not found');
      }
    } catch (err) {
      console.error('Error fetching pincode:', err);
      setPickupPincode('Error fetching pincode');
    }
  };

  // Yaha par calculte shipping handle ho rha hai via /order api routes
  const handleCalculateShipping = async () => {
    setShippingError("");
    setCalculatedShipping(null);
    const weight = formData.weightGram / 1000;
    const orderValue = formData.units * formData.unitPrice * (1 + (formData.tax / 100));
    const cod = formData.paymentMethod === "COD";

    if (isNaN(orderValue) || orderValue <= 0) {
      setShippingError("Invalid order value for calculation");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Pickup_pincode: pickupPincode,
          Delivery_pincode: formData.pinCode,
          cod,
          total_order_value: parseInt(orderValue),
          weight
        })
      });
      const data = await res.json();

      if (res.ok) {
        setCalculatedShipping(data);
        // Note: Calculation options (data) are not saved to DB here. Only selected option will be saved on submit.
      } else {
        setShippingError(data.error || "Shipping calculation failed");
      }
    } catch (err) {
      setShippingError("Network error: " + err.message);
    }
  };

  // New: Handle selection of a shipping option (e.g., Delhivery Surface ₹61.00)
  const handleSelectShipping = (item) => {
    setFormData((prev) => ({
      ...prev,
      selectShippingCharges: Number(item.total_Price_GST_Included),
      selectedCourierName: item.courier_name,
      selectedFreightMode: item.freight_mode
    }));
    // Optional: Show a success message or highlight the selected item
    setMessage({ type: "success", text: `Selected ${item.courier_name} (${item.freight_mode}) for ₹${Number(item.total_Price_GST_Included).toFixed(2)}` });
  };

  // 🔹 Automatically call API when all fields are valid
  useEffect(() => {
    const weight = formData.weightGram / 1000;
    const orderValue =
      formData.units * formData.unitPrice * (1 + formData.tax / 100);

    if (
      pickupPincode &&
      pickupPincode.length === 6 &&
      formData.pinCode &&
      formData.pinCode.length === 6 &&
      weight > 0 &&
      orderValue > 0
    ) {
      // Debounce (optional): wait a bit to avoid rapid API calls while typing
      const timeout = setTimeout(() => {
        handleCalculateShipping();
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [pickupPincode, formData.pinCode, formData.weightGram, formData.units, formData.unitPrice, formData.tax, formData.paymentMethod]);

  // auto-calc total whenever units/unitPrice/shipping change, but allow user override
  useEffect(() => {
    const itemsTotal = Number(formData.units || 0) * Number(formData.unitPrice || 0);
    const taxAmt = (Number(formData.tax || 0) / 100) * itemsTotal;
    const calcTotal = itemsTotal + taxAmt + Number(formData.shippingCharges || 0) + (formData.paymentMethod === "COD" ? Number(formData.codCharges || 0) : 0);
    setFormData((prev) => ({ ...prev, totalOrderValue: Math.round(calcTotal * 100) / 100 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.units, formData.unitPrice, formData.tax, formData.shippingCharges, formData.codCharges, formData.paymentMethod]);

  // validation kar rhe hain yaha par 
  const validate = () => {
    const errs = [];
    if (!formData.orderId || String(formData.orderId).trim().length < 1) errs.push("Order number is required");
    if (!/^[6-9]\d{9}$/.test(String(formData.phone))) errs.push("Phone must be 10 digits starting with 6/7/8/9");
    if (!/^\d{6}$/.test(String(formData.pinCode))) errs.push("PinCode must be 6 digits");
    if (!formData.itemName || String(formData.itemName).trim().length < 3) errs.push("Item name must be at least 3 characters");
    if (!(Number(formData.units) > 0)) errs.push("Units must be > 0");
    if (!(Number(formData.unitPrice) > 0)) errs.push("Unit price must be > 0");
    if (!["PREPAID", "COD"].includes(formData.paymentMethod)) errs.push("Payment method must be PREPAID or COD");
    if (!(Number(formData.packageLength) >= 0)) errs.push("Package length required");
    if (!(Number(formData.packageBreadth) >= 0)) errs.push("Package breadth required");
    if (!(Number(formData.packageHeight) >= 0)) errs.push("Package height required");
    if (!(Number(formData.weightGram) >= 0)) errs.push("Weight required");
    // New: Check if shipping service is selected
    if (!formData.selectedCourierName) errs.push("Please select a delivery service");
    return errs;
  };

  // New: Handle wallet deduction for PREPAID
  const handleWalletDeduction = async (amountToDeduct) => {
    try {
      const res = await fetch("http://localhost:5000/deduct-wallet", { // Assuming an API endpoint for wallet deduction
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          amount: amountToDeduct,
          reason: "Order creation - PREPAID"
        })
      });
      const data = await res.json();
      if (res.ok && data.status) {
        // Optionally refresh wallet balance from context or API
        return true;
      } else {
        throw new Error(data.message || "Wallet deduction failed");
      }
    } catch (err) {
      console.error("Wallet deduction error:", err);
      setMessage({ type: "error", text: `Wallet deduction failed: ${err.message}` });
      return false;
    }
  };

  // currency convertion kar rhe hain yaha par
  const formatCurrency = (v) => {
    return `₹ ${Number(v || 0).toFixed(2)}`;
  };

  // yaha par cheack kar rhe hain ki right value select hui hai showing shipping services se
  const isSelected = (item) => {
    return formData.selectedCourierName === item.courier_name && formData.selectedFreightMode === item.freight_mode && formData.selectShippingCharges === item.total_Price_GST_Included;
  };

  // New: Close modal handler
  const closeShippingModal = () => {
    setShowShippingModal(false);
  };

  // form submit hone par request kar rhe backend ko yaha par
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    const v = validate();
    setErrors(v);
    if (v.length) {
      // If shipping not selected, show custom popup instead of just error list
      if (v.some(err => err.includes("delivery service"))) {
        setShowShippingModal(true);
        return;
      }
      return;
    }

    setLoading(true);

    // New: Handle PREPAID wallet check and deduction
    if (formData.paymentMethod === "PREPAID") {
      const itemsTotal = Number(formData.units || 0) * Number(formData.unitPrice || 0);
      const taxAmt = (Number(formData.tax || 0) / 100) * itemsTotal;

      const shipping = Number(formData.selectShippingCharges || 0);
      const amountToDeduct = shipping + shipping / 2; // As per requirement: order_value + shipping/2 (RTO half already in wallet)

      if (walletBalance < amountToDeduct) {
        setMessage({ type: "error", text: `Insufficient wallet balance. Required: ${formatCurrency(amountToDeduct)}, Available: ${formatCurrency(walletBalance)}` });
        setLoading(false);
        return;
      }

      // Deduct from wallet
      const deductionSuccess = await handleWalletDeduction(amountToDeduct);
      if (!deductionSuccess) {
        setLoading(false);
        return;
      }

      // Update formData.shippingCharges to half for total calc if needed, but since total includes full, adjust if backend expects
      setFormData(prev => ({ ...prev, shippingCharges: halfShipping })); // Optional: Adjust displayed shipping to half for PREPAID
    }

    const shippingAddress = {
      firstName: formData.firstName,
      lastName: formData.lastName || "",
      addressLine1: formData.addressLine1,
      addressLine2: formData.addressLine2 || "",
      pinCode: String(formData.pinCode),
      email: formData.email || "",
      phone: String(formData.phone)
    };

    const packageDetails = {
      packageLength: Number(formData.packageLength),
      packageBreadth: Number(formData.packageBreadth),
      packageHeight: Number(formData.packageHeight),
      packageWeight: Number(formData.weightGram) / 1000
    };

    const orderItems = [
      {
        itemName: formData.itemName,
        sku: formData.sku || "",
        description: formData.description || "",
        units: Number(formData.units),
        unitPrice: Number(formData.unitPrice),
        tax: Number(formData.tax || 0),
        hsn: formData.hsn || "",
        productLength: null,
        productBreadth: null,
        productHeight: null,
        productWeight: packageDetails.packageWeight || null,
        brand: "",
        imageURL: "",
        isFragile: false,
        isPersonalisable: false
      }
    ];

    const payload = {
      orderId: String(formData.orderId),
      orderDate: formData.orderDate,
      pickupAddressName: formData.pickupAddressName || null,
      storeName: "DEFAULT",
      billingIsShipping: true,
      shippingAddress,
      billingAddress: null,
      orderItems,
      paymentMethod: formData.paymentMethod,
      shippingCharges: Number(formData.shippingCharges || 0),
      codCharges: Number(formData.codCharges || 0),
      prepaidAmount: formData.paymentMethod === "PREPAID" ? Number(formData.totalOrderValue || 0) : Number(formData.prepaidAmount || 0),
      totalOrderValue: Number(formData.totalOrderValue || 0),
      packageDetails,
      
      // New: Include selected shipping details for DB save
      selectShippingCharges: Number(formData.selectShippingCharges || 0 ),
      selectedCourierName: formData.selectedCourierName || null,
      selectedFreightMode: formData.selectedFreightMode || null,
    };

    try {
      const res = await fetch("http://localhost:5000/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include', // ← ADD THIS: Send auth cookies 
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Order created: " + (data.message || "success") });
        setFormData((prev) => ({ ...prev, orderId: "", itemName: "", totalOrderValue: 0, selectedCourierName: "", selectedFreightMode: "", shippingCharges: 0 }));
      } else {
        setMessage({ type: "error", text: "Error: " + (data.message || JSON.stringify(data)) });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network/Error: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg p-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-3">Add New Order</h2>
          <p className="text-sm text-muted-foreground mb-6"> Click pickup address name input field and select your pickup address </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Pickup Address Name *
                </label>

                <input
                  list="pickupAddressList"
                  name="pickupAddressName"
                  value={formData.pickupAddressName || ""}
                  onChange={handlePickupSelect}
                  className="w-full rounded-xl border p-3"
                  placeholder="Select or type address name"
                  required
                />

                <datalist id="pickupAddressList">
                  {pickupAddresses.map((name, i) => (
                    <option key={i} value={name} />
                  ))}
                </datalist>

                {/* Show fetched pincode below */}
                {pickupPincode && (
                  <p className="mt-2 text-sm text-gray-700">
                    📍 <strong>Pincode:</strong> {pickupPincode}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Order No *</label>
                <input name="orderId" value={formData.orderId} onChange={handleChange} className="w-full rounded-xl border p-3" required />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name *</label>
                <input name="firstName" value={formData.firstName} onChange={handleChange} className="w-full rounded-xl border p-3" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone *</label>
                <input name="phone" value={formData.phone} onChange={handleChange} className="w-full rounded-xl border p-3" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">PinCode *</label>
                <input name="pinCode" value={formData.pinCode} onChange={handleChange} className="w-full rounded-xl border p-3" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address Line 1 *</label>
              <input name="addressLine1" value={formData.addressLine1} onChange={handleChange} className="w-full rounded-xl border p-3" required />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Item Name *</label>
                <input name="itemName" value={formData.itemName} onChange={handleChange} className="w-full rounded-xl border p-3" required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Units *</label>
                <input type="number" min={1} name="units" value={formData.units} onChange={handleChange} className="w-full rounded-xl border p-3" required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Unit Price *</label>
                <input type="number" step="0.01" min={0} name="unitPrice" value={formData.unitPrice} onChange={handleChange} className="w-full rounded-xl border p-3" required />
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Length (cm) *</label>
                <input type="number" name="packageLength" value={formData.packageLength} onChange={handleChange} className="w-full rounded-xl border p-3" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Breadth (cm) *</label>
                <input type="number" name="packageBreadth" value={formData.packageBreadth} onChange={handleChange} className="w-full rounded-xl border p-3" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Height (cm) *</label>
                <input type="number" name="packageHeight" value={formData.packageHeight} onChange={handleChange} className="w-full rounded-xl border p-3" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Weight (grams) *</label>
                <input type="number" name="weightGram" value={formData.weightGram} onChange={handleChange} className="w-full rounded-xl border p-3" required />
                <p className="text-xs mt-1">Approx kg: {(Number(formData.weightGram || 0) / 1000).toFixed(3)}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Payment Method *</label>
                <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="w-full rounded-xl border p-3">
                  <option value="PREPAID">PREPAID</option>
                  <option value="COD">COD</option>
                </select>
              </div>

              {/* <div>
                <label className="block text-sm font-medium mb-1">Shipping Charges</label>
                <input type="number" name="shippingCharges" value={formData.shippingCharges} onChange={handleChange} className="w-full rounded-xl border p-3" />
              </div> */}

              {/* <div>
                <label className="block text-sm font-medium mb-1">COD Charges</label>
                <input type="number" name="codCharges" value={formData.codCharges} onChange={handleChange} className="w-full rounded-xl border p-3" />
              </div> */}
            </div>

            {shippingError && (
              <div className="bg-red-50 text-red-700 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm">{shippingError}</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button type="submit" disabled={loading} className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl px-5 py-2 font-medium shadow-md">
                {loading ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="4" stroke="rgba(255,255,255,0.3)" fill="none" /></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /></svg>
                )}
                {loading ? "Creating..." : "Add New Order"}
              </button>

              <button type="button" onClick={() => {
                setFormData({
                  orderId: "",
                  orderDate: new Date().toISOString().split("T")[0],
                  firstName: "",
                  lastName: "",
                  email: "",
                  phone: "",
                  addressLine1: "",
                  addressLine2: "",
                  pinCode: "",
                  packageLength: 0,
                  packageBreadth: 0,
                  packageHeight: 0,
                  weightGram: 0,
                  itemName: "",
                  sku: "",
                  description: "",
                  units: 1,
                  unitPrice: 0,
                  tax: 0,
                  hsn: "",
                  pickupAddressName: "",
                  paymentMethod: "PREPAID",
                  totalOrderValue: 0,
                  shippingCharges: 0,
                  codCharges: 0,
                  selectedCourierName: "",
                  selectedFreightMode: ""
                });
                setErrors([]);
                setMessage(null);
                setCalculatedShipping(null);
                setShippingError("");
              }} className="rounded-2xl border px-4 py-2">Reset</button>
            </div>

            {errors.length > 0 && !showShippingModal && ( // Hide errors if modal is shown for shipping
              <div className="bg-red-50 text-red-700 rounded-xl p-3">
                <strong className="block mb-1">Validation</strong>
                <ul className="list-disc ml-5 text-sm">
                  {errors.map((er, i) => <li key={i}>{er}</li>)}
                </ul>
              </div>
            )}

            {message && (
              <div className={`rounded-xl p-3 ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                <div className="flex items-center gap-2">
                  {message.type === "success" ? <CheckCircle /> : <XCircle />}
                  <div className="text-sm">{message.text}</div>
                </div>
              </div>
            )}

          </form>
        </div>

        <aside className="bg-slate-50 rounded-2xl p-4 space-y-8">
          {/* Yaha par Assign shipment ka code hai  */}
          <div className="space-y-3">
            {calculatedShipping?.length > 0 ? (
              calculatedShipping.map((item, index) => (
                <div
                  key={index}
                  className={`flex justify-between items-center border border-gray-200 rounded-2xl p-3 shadow-sm hover:shadow-md transition-shadow ${isSelected(item) ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                >
                  <div className="flex flex-col">
                
                    <span className="text-sm font-semibold text-gray-800">
                      {item.courier_name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {item.freight_mode}
                    </span>
                  </div>

                  <div className="text-sm font-medium text-green-600">
                    ₹{Number(item.total_Price_GST_Included).toFixed(2)}
                  </div>

                  <button
                    onClick={() => handleSelectShipping(item)}
                    className={`p-1 rounded-sm cursor-pointer text-xs font-medium ${isSelected(item)
                      ? 'bg-green-500 text-white'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                  >
                    {isSelected(item) ? 'Selected ✓' : 'Select'}
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No shipping options available. Fill pincode, weight, etc.</p>
            )}
          </div>

          {/* Order summary dikha rha fields ke yaha  */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span>Order No</span><strong>{formData.orderId || "—"}</strong></div>
              <div className="flex justify-between"><span>Item</span><strong>{formData.itemName || "—"}</strong></div>
              <div className="flex justify-between"><span>Qty</span><strong>{formData.units}</strong></div>
              <div className="flex justify-between"><span>Unit Price</span><strong>{formatCurrency(formData.unitPrice)}</strong></div>
              <div className="flex justify-between"><span>Shipping</span><strong>{formatCurrency(formData.shippingCharges)}</strong></div>
              {formData.selectedCourierName && (
                <div className="flex justify-between"><span>Selected Courier</span><strong>{formData.selectedCourierName} ({formData.selectedFreightMode})</strong></div>
              )}
              <div className="flex justify-between"><span>COD Charges</span><strong>{formatCurrency(formData.codCharges)}</strong></div>
              <hr />
              <div className="flex justify-between text-base"><span className="font-medium">Total</span><strong className="text-lg">{formatCurrency(formData.totalOrderValue)}</strong></div>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              <p><strong>Package:</strong> {formData.packageLength}×{formData.packageBreadth}×{formData.packageHeight} cm</p>
              <p>Weight: {(Number(formData.weightGram || 0) / 1000).toFixed(3)} kg</p>
              <p className="mt-2">Payment: <span className="font-medium">{formData.paymentMethod}</span></p>
              {formData.paymentMethod === "PREPAID" && (
                <p>Wallet Balance: {formatCurrency(walletBalance)}</p>
              )}
            </div>
          </div>

        </aside>
      </motion.div>

      {/* New: Custom Popup/Modal for Shipping Selection Validation */}
      {showShippingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-xl">
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="h-12 w-12 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-800">Please Select Delivery Service</h3>
              <p className="text-sm text-gray-600 text-center">
                You must select a shipping option (e.g., Delhivery Surface) before creating the order.
              </p>
              <button
                onClick={closeShippingModal}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-2 font-medium"
              >
                OK, Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}