"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import { API_BASE_URL } from "@/utils/api";

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
    paymentMethod: "",
    totalOrderValue: 0,
    shippingCharges: 0,
    codCharges: 0,
    selectShippingCharges: 0,
    selectedCourierName: "",
    selectedFreightMode: "",
  });

  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [pickupAddresses, setPickupAddresses] = useState([]);
  const [pickupPincode, setPickupPincode] = useState("");

  // yaha par form ke input value chageho rahi hian on event on change ok
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  // Find all Pickup Address by user unique id
  useEffect(() => {
    const fetchPickupAddresses = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/fetchAllPickupAddress`, {
          method: "GET",
          credentials: "include", // <- MUST for httpOnly cookies
        });
        const data = await res.json();
        if (res.ok && data.status) {
          setPickupAddresses(data.data);
        } else {
          console.error(
            "Failed to fetch pickup addresses:",
            data.message || data,
          );
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

    // update formDataun save  to keep compatibility with your submit
    setFormData((prev) => ({
      ...prev,
      pickupAddressName: value,
    }));

    setPickupPincode(""); // reset previous

    if (!value.trim()) return;

    const url = `${API_BASE_URL}/fetchPickupLocationPicode?addressName=${encodeURIComponent(value)}`;

    try {
      // 1) first attempt — include cookies
      let res = await fetch(url, { method: "GET", credentials: "include" });

      // 2) if unauthorized, try refresh endpoint once (also include cookies)
      if (res.status === 401) {
        console.warn("Got 401 — attempting token refresh...");
        const refreshRes = await fetch(`${API_BASE_URL}/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (refreshRes.ok) {
          console.log("Token refresh succeeded — retrying pincode fetch");
          res = await fetch(url, { method: "GET", credentials: "include" });
        } else {
          console.warn("Refresh failed:", await refreshRes.text());
        }
      }

      // 3) handle final response
      const data = await res.json().catch(() => null);

      if (res.ok && data && data.status) {
        setPickupPincode(data.data.pincode);
      } else if (res.status === 401) {
        // final unauthorized
        console.error("Unauthorized. Please login again.");
        setPickupPincode("Unauthorized — please login");
      } else {
        console.error("Failed to fetch pincode:", res.status, data);
        setPickupPincode("Not found");
      }
    } catch (err) {
      console.error("Error fetching pincode:", err);
      setPickupPincode("Error fetching pincode");
    }
  };

  // auto-calc total whenever units/unitPrice/shipping change, but allow user override
  useEffect(() => {
    const itemsTotal =
      Number(formData.units || 0) * Number(formData.unitPrice || 0);
    const taxAmt = (Number(formData.tax || 0) / 100) * itemsTotal;
    const calcTotal =
      itemsTotal +
      taxAmt +
      Number(formData.shippingCharges || 0) +
      (formData.paymentMethod === "COD" ? Number(formData.codCharges || 0) : 0);
    setFormData((prev) => ({
      ...prev,
      totalOrderValue: Math.round(calcTotal * 100) / 100,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formData.units,
    formData.unitPrice,
    formData.tax,
    formData.shippingCharges,
    formData.codCharges,
    formData.paymentMethod,
  ]);

  // validation kar rhe hain yaha par
  const validate = () => {
    const errs = [];
    if (!formData.orderId || String(formData.orderId).trim().length < 1)
      errs.push("Order number is required");
    if (!/^[6-9]\d{9}$/.test(String(formData.phone)))
      errs.push("Phone must be 10 digits starting with 6/7/8/9");
    if (!/^\d{6}$/.test(String(formData.pinCode)))
      errs.push("PinCode must be 6 digits");
    if (!formData.itemName || String(formData.itemName).trim().length < 3)
      errs.push("Item name must be at least 3 characters");
    if (!(Number(formData.units) > 0)) errs.push("Units must be > 0");
    if (!(Number(formData.unitPrice) > 0)) errs.push("Unit price must be > 0");
    if (!(Number(formData.packageLength) > 0))
      errs.push("Package length must be > 0");
    if (!(Number(formData.packageBreadth) > 0))
      errs.push("Package breadth must be > 0");
    if (!(Number(formData.packageHeight) > 0))
      errs.push("Package height must be > 0");
    if (!(Number(formData.weightGram) > 0)) errs.push("Weight must be > 0");
    return errs;
  };

  // currency convertion kar rhe hain yaha par
  const formatCurrency = (v) => {
    return `₹ ${Number(v || 0).toFixed(2)}`;
  };

  // form submit hone par request kar rhe backend ko yaha par
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    const v = validate();
    setErrors(v);
    if (v.length) return;

    setLoading(true);

    const shippingAddress = {
      firstName: formData.firstName,
      lastName: formData.lastName || "",
      addressLine1: formData.addressLine1,
      addressLine2: formData.addressLine2 || "",
      pinCode: String(formData.pinCode),
      email: formData.email || "",
      phone: String(formData.phone),
    };

    const packageDetails = {
      packageLength: Number(formData.packageLength),
      packageBreadth: Number(formData.packageBreadth),
      packageHeight: Number(formData.packageHeight),
      packageWeight: Number(formData.weightGram) / 1000,
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
        isPersonalisable: false,
      },
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
      shippingCharges: Number(formData.shippingCharges || 0),
      codCharges: Number(formData.codCharges || 0),
      prepaidAmount: Number(formData.prepaidAmount || 0),
      paymentMethod: formData.paymentMethod || "PREPAID",
      totalOrderValue: Number(formData.totalOrderValue || 0),
      packageDetails,

      // New: Include selected shipping details for DB save
      selectShippingCharges: Number(formData.selectShippingCharges || 0),
      selectedCourierName: formData.selectedCourierName || null,
      selectedFreightMode: formData.selectedFreightMode || null,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ← ADD THIS: Send auth cookies
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: "success",
          text: "Order created: " + (data.message || "success"),
        });
        setFormData((prev) => ({
          ...prev,
          orderId: "",
          itemName: "",
          totalOrderValue: 0,
          selectedCourierName: "",
          selectedFreightMode: "",
          shippingCharges: 0,
        }));
      } else {
        setMessage({
          type: "error",
          text: "Error: " + (data.message || JSON.stringify(data)),
        });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network/Error: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl text-black mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 grid lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-3">Add New Order</h2>
          <p className="text-sm text-muted-foreground mb-6">
            {" "}
            Click pickup address name input field and select your pickup
            address{" "}
          </p>

          <h1 className="text-xl font-semibold mb-3">Pick Up Address Info</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Pickup Address Name *
                </label>

                <select
                  name="pickupAddressName"
                  value={formData.pickupAddressName || ""}
                  onChange={handlePickupSelect}
                  className="w-full text-black rounded-xl border p-3"
                  required
                  disabled={pickupAddresses.length === 0}
                >
                  <option value="" disabled>
                    {pickupAddresses.length === 0 ? "No name found" : "Select pickup address"}
                  </option>
                  {pickupAddresses.map((name, i) => (
                    <option key={i} value={name}>{name}</option>
                  ))}
                </select>

                {/* Show fetched pincode below */}
                {pickupPincode && (
                  <p className="mt-2 text-sm text-gray-700">
                    📍 <strong>Pincode:</strong> {pickupPincode}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Order No *
                </label>
                <input
                  name="orderId"
                  value={formData.orderId}
                  onChange={handleChange}
                  placeholder="e.g #123456"
                  className="w-full text-black rounded-xl border p-3"
                  required
                />
              </div>
            </div>
            
            <h1 className="text-xl font-semibold mb-3">Delivery Address Info</h1>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="e.g Rahul"
                  className="w-full text-black rounded-xl border p-3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone *
                </label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g  +91 12345678"
                  className="w-full text-black rounded-xl border p-3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  PinCode *
                </label>
                <input
                  name="pinCode"
                  value={formData.pinCode}
                  onChange={handleChange}
                  placeholder="e.g 123456"
                  className="w-full text-black rounded-xl border p-3"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Address Line 1 *
              </label>
              <input
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                className="w-full text-black rounded-xl border p-3"
                required
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Item Name *
                </label>
                <input
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleChange}
                  placeholder="e.g T-shirt" 
                  className="w-full text-black rounded-xl border p-3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Units *
                </label>
                <input
                  type="number"
                  min={1}
                  name="units"
                  value={formData.units}
                  onChange={handleChange}
                  className="w-full text-black rounded-xl border p-3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Unit Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  name="unitPrice"
                  value={formData.unitPrice}
                  onChange={handleChange}
                  className="w-full text-black rounded-xl border p-3"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Length (cm) *
                </label>
                <input
                  type="number"
                  min={1}
                  name="packageLength"
                  value={formData.packageLength}
                  onChange={handleChange}
                  className="w-full text-black rounded-xl border p-3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Breadth (cm) *
                </label>
                <input
                  type="number"
                  min={1}
                  name="packageBreadth"
                  value={formData.packageBreadth}
                  onChange={handleChange}
                  className="w-full text-black rounded-xl border p-3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Height (cm) *
                </label>
                <input
                  type="number"
                  min={1}
                  name="packageHeight"
                  value={formData.packageHeight}
                  onChange={handleChange}
                  className="w-full text-black rounded-xl border p-3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Weight (grams) *
                </label>
                <input
                  type="number"
                  min={1}
                  name="weightGram"
                  value={formData.weightGram}
                  onChange={handleChange}
                  className="w-full text-black rounded-xl border p-3"
                  required
                />
                <p className="text-xs mt-1">
                  Approx kg:{" "}
                  {(Number(formData.weightGram || 0) / 1000).toFixed(3)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl px-5 py-2 font-medium shadow-md"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      strokeWidth="4"
                      stroke="rgba(255,255,255,0.3)"
                      fill="none"
                    />
                  </svg>
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14" />
                  </svg>
                )}
                {loading ? "Creating..." : "Add New Order"}
              </button>

              <button
                type="button"
                onClick={() => {
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
                    paymentMethod: "",
                    totalOrderValue: 0,
                    shippingCharges: 0,
                    codCharges: 0,
                    selectedCourierName: "",
                    selectedFreightMode: "",
                  });
                  setErrors([]);
                  setMessage(null);
                }}
                className="rounded-2xl border px-4 py-2"
              >
                Reset
              </button>
            </div>

            {errors.length > 0 && (
              <div className="bg-red-50 text-red-700 rounded-xl p-3">
                <strong className="block mb-1">Validation</strong>
                <ul className="list-disc ml-5 text-sm">
                  {errors.map((er, i) => (
                    <li key={i}>{er}</li>
                  ))}
                </ul>
              </div>
            )}

            {message && (
              <div
                className={`rounded-xl p-3 ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
              >
                <div className="flex items-center gap-2">
                  {message.type === "success" ? <CheckCircle /> : <XCircle />}
                  <div className="text-sm">{message.text}</div>
                </div>
              </div>
            )}
          </form>
        </div>

        <aside className="bg-slate-50 p-4 space-y-8">
          {/* <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
            Delivery service and payment selection will be available after admin approval. Your order will be created now, and you can schedule it later.
          </div> */}
          {/* Order summary dikha rha fields ke yaha  */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Order No</span>
                <strong>{formData.orderId || "—"}</strong>
              </div>
              <div className="flex justify-between">
                <span>Item</span>
                <strong>{formData.itemName || "—"}</strong>
              </div>
              <div className="flex justify-between">
                <span>Qty</span>
                <strong>{formData.units}</strong>
              </div>
              <div className="flex justify-between">
                <span>Unit Price</span>
                <strong>{formatCurrency(formData.unitPrice)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <strong>{formatCurrency(formData.shippingCharges)}</strong>
              </div>
              {formData.selectedCourierName && (
                <div className="flex justify-between">
                  <span>Selected Courier</span>
                  <strong>
                    {formData.selectedCourierName} (
                    {formData.selectedFreightMode})
                  </strong>
                </div>
              )}
              <div className="flex justify-between">
                <span>COD Charges</span>
                <strong>{formatCurrency(formData.codCharges)}</strong>
              </div>
              <hr />
              <div className="flex justify-between text-base">
                <span className="font-medium">Total</span>
                <strong className="text-lg">
                  {formatCurrency(formData.totalOrderValue)}
                </strong>
              </div>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              <p>
                <strong>Package:</strong> {formData.packageLength}×
                {formData.packageBreadth}×{formData.packageHeight} cm
              </p>
              <p>
                Weight: {(Number(formData.weightGram || 0) / 1000).toFixed(3)}{" "}
                kg
              </p>
              <p className="mt-2">
                Payment:{" "}
                <span className="font-medium">
                  {formData.paymentMethod || "PENDING"}
                </span>
              </p>
            </div>
          </div>
        </aside>
      </motion.div>
    </div>
  );
}
