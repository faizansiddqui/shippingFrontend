"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  MapPin,
  User,
  Plus,
} from "lucide-react";
import { useAuth } from "../../../utils/checkAuth"; // Adjust path
import PickupList from "./components/PickupList";
import { API_BASE_URL } from "@/utils/api";
import PickupFormModal from "./components/PickupFormModal";

export default function PickupAddress() {
  const { user, loading: authLoading } = useAuth(false);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [modalInitial, setModalInitial] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (message) setMessage(null);
  }, [preview]);

  const resetPreview = () => {
    setPreview(null);
    setMessage(null);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }
  if (!user) return null; // Redirect handled by hook

  const handleSelect = async (name) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/getPickupLocation?addressName=${encodeURIComponent(name)}`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (res.ok && data) {
        const payload = data.data || data;
        setModalInitial(payload);
        setModalMode("view");
        setModalOpen(true);
        setPreview(payload);
        setMessage(null);
      } else {
        setPreview(null);
        setMessage({
          type: "error",
          text: data?.message || "Could not load pickup details",
        });
      }
    } catch (err) {
      setPreview(null);
      setMessage({
        type: "error",
        text: err.message || "Error loading pickup details",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (name) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/getPickupLocation?addressName=${encodeURIComponent(name)}`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (res.ok && data) {
        const payload = data.data || data;
        setModalInitial(payload);
        setModalMode("edit");
        setModalOpen(true);
      } else {
        setMessage({
          type: "error",
          text: data?.message || "Could not load pickup details for edit",
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Error loading pickup details",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl text-black mx-auto p-2 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2 p-2">
          <div className="flex items-center justify-between mb-2 gap-2">
            <div>
              <h2 className="text-xl font-semibold">Pickup Addresses</h2>
              <p className="text-sm text-gray-500">
                Your saved pickup locations. Click Edit to modify, or Load to
                preview.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setModalMode("add");
                  setModalInitial({});
                  setModalOpen(true);
                }}
                className="inline-flex items-center gap-2 bg-sky-600 text-white rounded-2xl px-4 py-2"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </div>

          <PickupList
            onSelect={handleSelect}
            onEdit={handleEdit}
            refreshKey={refreshKey}
          />
        </div>

        <aside className="bg-slate-50 p-4">
          <h3 className="text-lg font-semibold mb-3">Preview</h3>
          <div className="space-y-3 text-sm">
            {!preview && (
              <div className="text-sm text-gray-500">
                Select an address from the list to preview its full details
                here.
              </div>
            )}

            {preview && (
              <>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1" />
                  <div>
                    <div className="font-medium">
                      {preview.address_name || "—"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {preview.address_line || "—"}
                    </div>
                    {preview.address_line2 && (
                      <div className="text-xs text-gray-500">
                        {preview.address_line2}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      {preview.city
                        ? `${preview.city} — ${preview.pincode || "—"}`
                        : "—"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone />
                  <div>
                    <div className="font-medium">
                      {preview.contact_number || "—"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {preview.contact_name || "—"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail />
                  <div className="text-sm">{preview.email || "—"}</div>
                </div>

                {preview.use_alt_rto_address && (
                  <div className="mt-3 bg-gray-50 rounded p-3 text-xs">
                    <div className="font-medium">
                      RTO —{" "}
                      {preview.create_rto_address?.rto_address_name || "—"}
                    </div>
                    <div>
                      {preview.create_rto_address?.rto_address_line || "—"}
                    </div>
                    <div>
                      {preview.create_rto_address?.rto_city
                        ? `${preview.create_rto_address.rto_city} — ${preview.create_rto_address.rto_pincode || "—"}`
                        : "—"}
                    </div>
                    <div className="mt-2 text-gray-500">
                      RTO contact:{" "}
                      {preview.create_rto_address?.rto_contact_number || "—"}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <p className="mt-3 text-xs text-gray-400">
            Preview is read-only. Use Edit to modify an address.
          </p>
        </aside>
      </motion.div>

      {modalOpen && (
        <PickupFormModal
          mode={modalMode}
          initialData={modalInitial}
          user={user}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setRefreshKey((k) => k + 1);
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
