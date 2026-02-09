"use client"

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Mail, Phone, MapPin, User } from "lucide-react";
import { useAuth } from '../../../utils/checkAuth'; // Adjust path

export default function PickupAddress() {
  const { user, loading: authLoading } = useAuth();
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
    create_rto_address: {
      rto_address_name: "",
      rto_contact_name: "",
      rto_contact_number: "",
      rto_email: "",
      rto_address_line: "",
      rto_address_line2: "",
      rto_city: "",
      rto_pincode: "",
      rto_gstin: "",
    },
  });

  
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (message) setMessage(null);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("create_rto_address.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        create_rto_address: {
          ...prev.create_rto_address,
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
    if (!formData.address_name || String(formData.address_name).trim().length < 2) errs.push("Company/Business name required");
    if (!formData.contact_name || String(formData.contact_name).trim().length < 2) errs.push("Contact person name required");
    if (!/^[6-9]\d{9}$/.test(String(formData.contact_number))) errs.push("Contact number must be 10 digits starting with 6/7/8/9");
    if (formData.email && !/^\S+@\S+\.\S+$/.test(String(formData.email))) errs.push("Email looks invalid");
    if (!formData.address_line || String(formData.address_line).trim().length < 5) errs.push("Address line 1 required (min 5 chars)");
    if (!formData.city || String(formData.city).trim().length < 2) errs.push("City is required");
    if (!/^\d{6}$/.test(String(formData.pincode))) errs.push("Pincode must be 6 digits");

    if (formData.use_alt_rto_address) {
      const r = formData.create_rto_address;
      if (!r.rto_address_name || r.rto_address_name.trim().length < 2) errs.push("RTO: company name required");
      if (!r.rto_contact_name || r.rto_contact_name.trim().length < 2) errs.push("RTO: contact name required");
      if (!/^[6-9]\d{9}$/.test(String(r.rto_contact_number))) errs.push("RTO: contact number invalid");
      if (!r.rto_address_line || r.rto_address_line.length < 5) errs.push("RTO: address line 1 required");
      if (!r.rto_city || r.rto_city.trim().length < 2) errs.push("RTO: city required");
      if (!/^\d{6}$/.test(String(r.rto_pincode))) errs.push("RTO: pincode must be 6 digits");
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setMessage({ type: "error", text: "Please log in to save address" });
      return;
    }
    setMessage(null);
    const v = validate();
    setErrors(v);
    if (v.length) return;

    setLoading(true);
    const payload = { ...formData, user_id: user.id };
    console.log("Payload", payload);
    console.log("User Id", user.id);
    
    
    if (!payload.use_alt_rto_address) payload.create_rto_address = {};

    try {
      const res = await fetch("http://localhost:5000/create/pickup_location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Pickup address created successfully" });
        setFormData({
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
          create_rto_address: {
            rto_address_name: "",
            rto_contact_name: "",
            rto_contact_number: "",
            rto_email: "",
            rto_address_line: "",
            rto_address_line2: "",
            rto_city: "",
            rto_pincode: "",
            rto_gstin: "",
          },
        });
      } else {
        setMessage({ type: "error", text: data.message || "Failed to create pickup address" });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
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
      create_rto_address: {
        rto_address_name: "",
        rto_contact_name: "",
        rto_contact_number: "",
        rto_email: "",
        rto_address_line: "",
        rto_address_line2: "",
        rto_city: "",
        rto_pincode: "",
        rto_gstin: "",
      },
    });
    setErrors([]);
    setMessage(null);
  };

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div></div>;
  }

  if (!user) return null; // Redirect handled by hook

  return (
    <div className="max-w-5xl text-black mx-auto p-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="lg:col-span-2 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Add Pickup Address</h2>
              <p className="text-sm text-gray-500">Create a pickup location for pickup teams and RTOs.</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={resetForm} className="text-sm px-3 py-1 rounded border">Reset</button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Company / Business Name *</label>
              <input name="address_name" value={formData.address_name} onChange={handleChange} className="w-full rounded-xl border p-3" placeholder="e.g MS Logistics" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Contact Person *</label>
              <input name="contact_name" value={formData.contact_name} onChange={handleChange} className="w-full rounded-xl border p-3" placeholder="e.g Rahul" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Mobile No. *</label>
              <input name="contact_number" value={formData.contact_number} onChange={handleChange} maxLength={10} className="w-full rounded-xl border p-3" placeholder="e.g 9876543210" required />
              <p className="text-xs text-gray-400 mt-1">Enter 10-digit mobile number without +91</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input name="email" value={formData.email} onChange={handleChange} className="w-full rounded-xl border p-3" placeholder="e.g example@example.com" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Address Line 1 *</label>
              <input name="address_line" value={formData.address_line} onChange={handleChange} className="w-full rounded-xl border p-3" placeholder="e.g 123 Main St" required />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Address Line 2</label>
              <input name="address_line2" value={formData.address_line2} onChange={handleChange} className="w-full rounded-xl border p-3" placeholder="e.g Apt 4B" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">City *</label>
              <input name="city" value={formData.city} onChange={handleChange} className="w-full rounded-xl border p-3" placeholder="e.g Mumbai" required />
            </div>


            <div>
              <label className="block text-sm font-medium mb-1">Pincode *</label>
              <input name="pincode" value={formData.pincode} onChange={handleChange} maxLength={6} className="w-full rounded-xl border p-3" placeholder="e.g 400001" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">GSTIN (optional)</label>
              <input name="gstin" value={formData.gstin} onChange={handleChange} className="w-full rounded-xl border p-3" placeholder="e.g 27AAECS1234F1Z5" />
            </div>

            <div className="flex items-center gap-4">
              {/* <label className="flex items-center gap-2">
                <input name="dropship_location" type="checkbox" checked={formData.dropship_location} onChange={handleChange} />
                <span className="text-sm">Dropship Location</span>
              </label> */}

              {/* <label className="flex items-center gap-2">
                <input name="use_alt_rto_address" type="checkbox" checked={formData.use_alt_rto_address} onChange={handleChange} />
                <span className="text-sm">Use different RTO address</span>
              </label> */}
            </div>
          </div>

          {formData.use_alt_rto_address && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-medium mb-2">RTO Address Details</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <input name="create_rto_address.rto_address_name" value={formData.create_rto_address.rto_address_name} onChange={handleChange} placeholder="Company name" className="rounded-xl border p-3" />
                <input name="create_rto_address.rto_contact_name" value={formData.create_rto_address.rto_contact_name} onChange={handleChange} placeholder="Contact person" className="rounded-xl border p-3" />
                <input name="create_rto_address.rto_contact_number" value={formData.create_rto_address.rto_contact_number} onChange={handleChange} placeholder="Mobile (10 digits)" maxLength={10} className="rounded-xl border p-3" />
                <input name="create_rto_address.rto_email" value={formData.create_rto_address.rto_email} onChange={handleChange} placeholder="Email" className="rounded-xl border p-3" />
                <input name="create_rto_address.rto_address_line" value={formData.create_rto_address.rto_address_line} onChange={handleChange} placeholder="Address line 1" className="sm:col-span-2 rounded-xl border p-3" />
                <input name="create_rto_address.rto_address_line2" value={formData.create_rto_address.rto_address_line2} onChange={handleChange} placeholder="Address line 2" className="sm:col-span-2 rounded-xl border p-3" />
                <input name="create_rto_address.rto_city" value={formData.create_rto_address.rto_city} onChange={handleChange} placeholder="City" className="rounded-xl border p-3" />
                <input name="create_rto_address.rto_pincode" value={formData.create_rto_address.rto_pincode} onChange={handleChange} placeholder="Pincode" maxLength={6} className="rounded-xl border p-3" />
                <input name="create_rto_address.rto_gstin" value={formData.create_rto_address.rto_gstin} onChange={handleChange} placeholder="GSTIN" className="rounded-xl border p-3" />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button type="submit" disabled={loading} className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl px-5 py-2 font-medium">
              {loading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="4" stroke="rgba(255,255,255,0.3)" fill="none"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /></svg>
              )}
              {loading ? "Saving..." : "Save Pickup"}
            </button>

            <button type="button" onClick={resetForm} className="rounded-2xl border px-4 py-2">Clear</button>
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
            <div className={`mt-3 rounded-xl p-3 ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              <div className="flex items-center gap-2">
                {message.type === "success" ? <CheckCircle /> : <XCircle />}
                <div className="text-sm">{message.text}</div>
              </div>
            </div>
          )}
        </form>

        {/* Right column preview */}
        <aside className="bg-slate-50 p-4">
          <h3 className="text-lg font-semibold mb-3">Preview</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <MapPin className="mt-1" />
              <div>
                <div className="font-medium">{formData.address_name || "—"}</div>
                <div className="text-xs text-gray-500">{formData.address_line || "—"}</div>
                {formData.address_line2 && <div className="text-xs text-gray-500">{formData.address_line2}</div>}
                <div className="text-xs text-gray-500">{formData.city ? `${formData.city} — ${formData.pincode || '—'}` : "—"}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone />
              <div>
                <div className="font-medium">{formData.contact_number || '—'}</div>
                <div className="text-xs text-gray-500">{formData.contact_name || '—'}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail />
              <div className="text-sm">{formData.email || '—'}</div>
            </div>

            {/* <div className="pt-2 border-t text-xs text-gray-500">
              <div>GSTIN: {formData.gstin || '—'}</div>
              <div>Dropship: {formData.dropship_location ? 'Yes' : 'No'}</div>
              <div>RTO override: {formData.use_alt_rto_address ? 'Yes' : 'No'}</div>
            </div> */}

            {formData.use_alt_rto_address && (
              <div className="mt-3 bg-gray-50 rounded p-3 text-xs">
                <div className="font-medium">RTO — {formData.create_rto_address.rto_address_name || '—'}</div>
                <div>{formData.create_rto_address.rto_address_line || '—'}</div>
                <div>{formData.create_rto_address.rto_city ? `${formData.create_rto_address.rto_city} — ${formData.create_rto_address.rto_pincode || '—'}` : '—'}</div>
                <div className="mt-2 text-gray-500">RTO contact: {formData.create_rto_address.rto_contact_number || '—'}</div>
              </div>
            )}

          </div>

          <p className="mt-3 text-xs text-gray-400">This preview doesn't affect saved data — it's just to help you confirm details before saving.</p>
        </aside>
      </motion.div>
    </div>
  );
}