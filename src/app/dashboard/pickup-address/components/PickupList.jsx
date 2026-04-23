"use client";

import React, { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "@/utils/api";
import { Edit2 } from "lucide-react";

export default function PickupList({ onSelect, onEdit, refreshKey }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const sentinelRef = useRef(null);

  const fetchList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/fetchAllPickupAddress`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data && Array.isArray(data.data)) {
        setItems(data.data);
      } else if (res.ok && Array.isArray(data)) {
        setItems(data);
      } else {
        setError(data?.message || "Failed to fetch pickup addresses");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch pickup addresses");
    } finally {
      setLoading(false);
      setVisibleCount(10);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleCount((v) => Math.min(items.length, v + 10));
          }
        });
      },
      { rootMargin: "200px" },
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [items.length]);

  const visibleItems = items.slice(0, visibleCount);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium">Saved Pickup Addresses</h4>
        <button onClick={fetchList} className="text-xs text-blue-600">
          Refresh
        </button>
      </div>

      {loading && <div className="flex items-center justify-center mt-2 text-md text-gray-500">Loading...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="space-y-2">
          {items.length === 0 && (
            <div className="text-sm text-gray-500">
              No pickup addresses found.
            </div>
          )}
          {visibleItems.map((name, i) => (
            <div
              key={`${name}-${i}`}
              className="flex items-center justify-between bg-white rounded-xl p-2 shadow-sm"
            >
              <div className="text-sm font-medium truncate">{name}</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelect && onSelect(name)}
                  className="text-xs px-2 py-1 bg-sky-600 text-white rounded-md"
                >
                  View
                </button>
                <button
                  onClick={() => onEdit && onEdit(name)}
                  title="Edit"
                  className="text-xs px-2 py-1 bg-gray-100 rounded-md flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  {/* <span className="hidden sm:inline text-xs"></span> */}
                </button>
              </div>
            </div>
          ))}

          <div ref={sentinelRef} className="h-2"></div>

          {visibleCount < items.length && (
            <div className="text-center text-xs text-gray-500 mt-2">
              Scrolling loads more...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
