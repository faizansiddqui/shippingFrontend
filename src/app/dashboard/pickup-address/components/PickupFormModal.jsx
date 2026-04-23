"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { API_BASE_URL } from "@/utils/api";

export default function PickupFormModal({
  mode = "add",
  initialData = {},
  user,
  onClose,
  onSaved,
}) {
  const [formData, setFormData] = useState({
    address_name: "",
    contact_name: "",
    contact_number: "",
    email: "",
    address_line: "",
    address_line2: "",
    city: "",
    pincode: "",
    gstin: "",
    dropship_location: false,
    use_alt_rto_address: false,
    create_rto_address: {},
  });
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const isView = mode === "view";

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("create_rto_address.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        create_rto_address: {
          ...(prev.create_rto_address || {}),
          [key]: type === "checkbox" ? checked : value,
        },
      }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validate = () => {
    const errs = [];
    if (
      !formData.address_name ||
      String(formData.address_name).trim().length < 2
    )
      errs.push("Company/Business name required");
    if (
      !formData.contact_name ||
      String(formData.contact_name).trim().length < 2
    )
      errs.push("Contact person name required");
    if (!/^[6-9]\d{9}$/.test(String(formData.contact_number)))
      errs.push("Contact number must be 10 digits starting with 6/7/8/9");
    if (formData.email && !/^\S+@\S+\.\S+$/.test(String(formData.email)))
      errs.push("Email looks invalid");
    if (
      !formData.address_line ||
      String(formData.address_line).trim().length < 5
    )
      errs.push("Address line 1 required (min 5 chars)");
    if (!formData.city || String(formData.city).trim().length < 2)
      errs.push("City is required");
    if (!/^\d{6}$/.test(String(formData.pincode)))
      errs.push("Pincode must be 6 digits");
    if (formData.use_alt_rto_address) {
      const r = formData.create_rto_address || {};
      if (!r.rto_address_name || r.rto_address_name.trim().length < 2)
        errs.push("RTO: company name required");
      if (!r.rto_contact_name || r.rto_contact_name.trim().length < 2)
        errs.push("RTO: contact name required");
      if (!/^[6-9]\d{9}$/.test(String(r.rto_contact_number)))
        errs.push("RTO: contact number invalid");
      if (!r.rto_address_line || r.rto_address_line.length < 5)
        errs.push("RTO: address line 1 required");
      if (!r.rto_city || r.rto_city.trim().length < 2)
        errs.push("RTO: city required");
      if (!/^\d{6}$/.test(String(r.rto_pincode)))
        errs.push("RTO: pincode must be 6 digits");
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    if (!user) {
      setMessage({ type: "error", text: "Please log in to save address" });
      return;
    }
    setMessage(null);
    const v = validate();
    setErrors(v);
    if (v.length) return;

    setSaving(true);
    const payload = { ...formData, user_id: user.id };
    if (!payload.use_alt_rto_address) payload.create_rto_address = {};

    try {
      let res, dataText, data;
      if (mode === "add") {
        res = await fetch(`/api/pickup_location`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // edit
        const body = {
          ...payload,
          original_address_name:
            initialData.address_name || payload.address_name,
        };
        res = await fetch(`/api/updatePickupLocation`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      dataText = await res.text();
      try {
        data = dataText ? JSON.parse(dataText) : {};
      } catch (_) {
        data = {};
      }

      if (res.ok) {
        setMessage({
          type: "success",
          text:
            data.message ||
            (mode === "add"
              ? "Pickup address created"
              : "Pickup address updated"),
        });
        onSaved && onSaved();
        // keep modal open briefly to show message then close
        setTimeout(() => {
          onClose && onClose();
        }, 800);
      } else {
        const detail =
          data.detail ||
          data.error ||
          data.message ||
          dataText ||
          "Failed to save pickup address";
        setMessage({ type: "error", text: detail });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Failed to save pickup address",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => onClose && onClose()}
      />
      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto z-10"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {mode === "add" ? "Add Pickup Address" : "Edit Pickup Address"}
          </h3>
          <button
            type="button"
            onClick={() => onClose && onClose()}
            className="text-sm text-gray-600"
          >
            X
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Company / Business Name *
            </label>
            <input
              name="address_name"
              value={formData.address_name}
              onChange={handleChange}
              className="w-full rounded-xl border p-3"
              required
              readOnly={isView}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Contact Person *
            </label>
            <input
              name="contact_name"
              value={formData.contact_name}
              onChange={handleChange}
              className="w-full rounded-xl border p-3"
              required
              readOnly={isView}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Mobile No. *
            </label>
            <input
              name="contact_number"
              value={formData.contact_number}
              onChange={handleChange}
              maxLength={10}
              className="w-full rounded-xl border p-3"
              required
              readOnly={isView}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-xl border p-3"
              readOnly={isView}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Address Line 1 *
            </label>
            <input
              name="address_line"
              value={formData.address_line}
              onChange={handleChange}
              className="w-full rounded-xl border p-3"
              required
              readOnly={isView}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Address Line 2
            </label>
            <input
              name="address_line2"
              value={formData.address_line2}
              onChange={handleChange}
              className="w-full rounded-xl border p-3"
              readOnly={isView}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">City *</label>
            <input
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full rounded-xl border p-3"
              required
              readOnly={isView}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Pincode *</label>
            <input
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              maxLength={6}
              className="w-full rounded-xl border p-3"
              required
              readOnly={isView}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">GSTIN</label>
            <input
              name="gstin"
              value={formData.gstin}
              onChange={handleChange}
              className="w-full rounded-xl border p-3"
              readOnly={isView}
            />
          </div>
        </div>

        {formData.use_alt_rto_address && (
          <div className="bg-gray-50 rounded-xl p-4 mt-4">
            <h4 className="text-sm font-medium mb-2">RTO Address</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                name="create_rto_address.rto_address_name"
                value={formData.create_rto_address.rto_address_name || ""}
                onChange={handleChange}
                placeholder="Company name"
                className="rounded-xl border p-3"
              />
              <input
                name="create_rto_address.rto_contact_name"
                value={formData.create_rto_address.rto_contact_name || ""}
                onChange={handleChange}
                placeholder="Contact person"
                className="rounded-xl border p-3"
              />
              <input
                name="create_rto_address.rto_contact_number"
                value={formData.create_rto_address.rto_contact_number || ""}
                onChange={handleChange}
                placeholder="Mobile"
                maxLength={10}
                className="rounded-xl border p-3"
              />
              <input
                name="create_rto_address.rto_email"
                value={formData.create_rto_address.rto_email || ""}
                onChange={handleChange}
                placeholder="Email"
                className="rounded-xl border p-3"
              />
              <input
                name="create_rto_address.rto_address_line"
                value={formData.create_rto_address.rto_address_line || ""}
                onChange={handleChange}
                placeholder="Address line 1"
                className="sm:col-span-2 rounded-xl border p-3"
              />
              <input
                name="create_rto_address.rto_address_line2"
                value={formData.create_rto_address.rto_address_line2 || ""}
                onChange={handleChange}
                placeholder="Address line 2"
                className="sm:col-span-2 rounded-xl border p-3"
              />
              <input
                name="create_rto_address.rto_city"
                value={formData.create_rto_address.rto_city || ""}
                onChange={handleChange}
                placeholder="City"
                className="rounded-xl border p-3"
              />
              <input
                name="create_rto_address.rto_pincode"
                value={formData.create_rto_address.rto_pincode || ""}
                onChange={handleChange}
                placeholder="Pincode"
                maxLength={6}
                className="rounded-xl border p-3"
              />
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-3">
          {mode !== "view" && (
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl px-5 py-2 font-medium"
            >
              {saving
                ? "Saving..."
                : mode === "add"
                  ? "Save Pickup"
                  : "Update Pickup"}
            </button>
          )}
          <button
            type="button"
            onClick={() => onClose && onClose()}
            className="rounded-2xl border px-4 py-2"
          >
            {mode === "view" ? "Close" : "Cancel"}
          </button>
        </div>

        {errors.length > 0 && (
          <div className="bg-red-50 text-red-700 rounded-xl p-3 mt-3">
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
            className={`mt-3 rounded-xl p-3 ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
          >
            <div className="flex items-center gap-2">
              {message.type === "success" ? <CheckCircle /> : <XCircle />}
              <div className="text-sm">{message.text}</div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
