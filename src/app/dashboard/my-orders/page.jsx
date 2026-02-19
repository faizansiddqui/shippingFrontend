"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Download,
  Eye,
  X,
  Package,
  Calendar,
  User,
  Phone,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../../../utils/checkAuth"; // Adjust path as needed
import { useWallet } from "@/context/WalletContext";
import { API_BASE_URL } from "@/utils/api";

const OnlyMyOrder = () => {
  const { user, loading: authLoading } = useAuth();
  const { walletBalance, setWalletBalance } = useWallet();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    dateFrom: "",
    dateTo: "",
    status: "",
    paymentMethod: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [shippingModalOrder, setShippingModalOrder] = useState(null);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState(null);
  const [shippingPaymentMethod, setShippingPaymentMethod] = useState("");
  const [selectedShippingOption, setSelectedShippingOption] = useState(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState(new Set());
  const [labelLoading, setLabelLoading] = useState({});
  const [bulkStatusLoading, setBulkStatusLoading] = useState(false);
  const [bulkScheduleLoading, setBulkScheduleLoading] = useState(false);
  const [bulkScheduleIds, setBulkScheduleIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const itemsPerPage = 20; // Adjust as needed for performance
  const observer = useRef(null);
  const loadMoreRef = useRef(null);

  // Valid statuses matching backend
  const validStatuses = [
    "PENDING",
    "ACCEPTED",
    "REJECTED",
    "ON_WAY",
    "RTO",
    "DELIVERED",
  ];

  // Fetch orders
  const fetchOrders = async (append = false) => {
    if (!user) return;
    setLoading(!append);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/user-orders`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      console.log("Fetched user orders:", data);

      if (res.ok && data.status) {
        const newOrders = data.data || [];
        if (append) {
          setOrders((prev) => [...prev, ...newOrders]);
          setFilteredOrders((prev) => [...prev, ...newOrders]);
        } else {
          setOrders(newOrders);
          setFilteredOrders(newOrders);
          setCurrentPage(1);
          setHasMore(newOrders.length === itemsPerPage);
        }
      } else {
        setError(data.error || "Failed to fetch orders");
      }
    } catch (err) {
      setError("Network error: " + err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Initial fetch only (no auto-refresh or polling)
  useEffect(() => {
    if (!user || authLoading) return;
    fetchOrders();
  }, [user, authLoading]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setOrders([]);
    setFilteredOrders([]);
    setHasMore(true);
    fetchOrders();
    setSelectedOrderIds(new Set());
  }, [filters]);

  const getDisplayPaymentMethod = (order) => {
    if (!order?.selectedCourierName) return "PENDING";
    return order.paymentMethod || "PENDING";
  };

  const getAwbNumber = (order) =>
    order?.awbNumber ||
    order?.awb ||
    order?.awb_number ||
    order?.airwayBill ||
    order?.waybill ||
    order?.waybill_number ||
    "";

  const getLabelUrl = (order) =>
    order?.labelUrl ||
    order?.label_url ||
    order?.label_link ||
    order?.labelLink ||
    order?.label ||
    order?.pdf_label ||
    "";

  // Filter orders based on user input
  useEffect(() => {
    let filtered = orders;
    if (filters.search) {
      filtered = filtered.filter(
        (o) =>
          o.orderId
            .toString()
            .toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          o.orderItems?.[0]?.itemName
            ?.toLowerCase()
            .includes(filters.search.toLowerCase()),
      );
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(
        (o) => new Date(o.orderDate) >= new Date(filters.dateFrom),
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(
        (o) => new Date(o.orderDate) <= new Date(filters.dateTo),
      );
    }
    if (filters.status) {
      filtered = filtered.filter((o) => o.status === filters.status);
    }
    if (filters.paymentMethod) {
      filtered = filtered.filter(
        (o) =>
          o.selectedCourierName && o.paymentMethod === filters.paymentMethod,
      );
    }
    setFilteredOrders(filtered);
  }, [filters, orders]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const normalizeOrderId = (orderId) => {
    if (!orderId) return "";
    return String(orderId).trim();
  };

  const getOrderIdForApi = (orderId) => encodeURIComponent(normalizeOrderId(orderId));

  const getShipmentId = (orderId) => {
    const normalized = normalizeOrderId(orderId);
    return normalized.startsWith("#") ? normalized.slice(1) : normalized;
  };

  const toggleSelectAllVisible = () => {
    const allIds = paginatedOrders.map((o) => o.orderId).filter(Boolean);
    const allSelected = allIds.every((id) => selectedOrderIds.has(id));
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

  const updateOrderStatus = async (orderId, status) => {
    const normalizedId = normalizeOrderId(orderId);
    if (!normalizedId) {
      throw new Error("Order ID missing");
    }
    const res = await fetch(
      `${API_BASE_URL}/orders/${getOrderIdForApi(normalizedId)}/update-status`,
      {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
      },
    );
    const data = await res.json();
    if (!res.ok || !data?.status) {
      throw new Error(data?.message || "Failed to update status");
    }
    return data;
  };

  const handleApproveOne = async (orderId) => {
    try {
      if (!orderId) throw new Error("Order ID missing");
      await updateOrderStatus(orderId, "ACCEPTED");
      setOrders((prev) => prev.map((o) => (o.orderId === orderId ? { ...o, status: "ACCEPTED" } : o)));
      setFilteredOrders((prev) => prev.map((o) => (o.orderId === orderId ? { ...o, status: "ACCEPTED" } : o)));
    } catch (err) {
      alert(err.message || "Failed to approve order");
    }
  };

  const handleCancelOne = async (orderId) => {
    try {
      if (!orderId) throw new Error("Order ID missing");
      await updateOrderStatus(orderId, "REJECTED");
      setOrders((prev) => prev.map((o) => (o.orderId === orderId ? { ...o, status: "REJECTED" } : o)));
      setFilteredOrders((prev) => prev.map((o) => (o.orderId === orderId ? { ...o, status: "REJECTED" } : o)));
    } catch (err) {
      alert(err.message || "Failed to cancel order");
    }
  };

  const handleBulkStatus = async (status) => {
    if (selectedOrderIds.size === 0) return;
    setBulkStatusLoading(true);
    const ids = Array.from(selectedOrderIds).filter(Boolean);
    const eligibleIds = ids.filter((id) => {
      const order = orders.find((o) => o.orderId === id);
      return order && order.status === "PENDING" && !order.selectedCourierName;
    });
    if (eligibleIds.length === 0) {
      alert("Only PENDING orders can be approved/cancelled");
      setBulkStatusLoading(false);
      return;
    }
    const results = await Promise.allSettled(
      eligibleIds.map((id) => updateOrderStatus(id, status)),
    );
    const successIds = results
      .map((r, i) => (r.status === "fulfilled" ? eligibleIds[i] : null))
      .filter(Boolean);
    if (successIds.length > 0) {
      setOrders((prev) =>
        prev.map((o) => (successIds.includes(o.orderId) ? { ...o, status } : o)),
      );
      setFilteredOrders((prev) =>
        prev.map((o) => (successIds.includes(o.orderId) ? { ...o, status } : o)),
      );
    }
    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length > 0) {
      alert(`${failed.length} orders failed to update`);
    }
    setSelectedOrderIds(new Set());
    setBulkStatusLoading(false);
  };

  const hasNonPendingSelection = Array.from(selectedOrderIds).some((id) => {
    const order = orders.find((o) => o.orderId === id);
    return order && (order.status !== "PENDING" || order.selectedCourierName);
  });

  const hasScheduledSelection = Array.from(selectedOrderIds).some((id) => {
    const order = orders.find((o) => o.orderId === id);
    return order && order.selectedCourierName;
  });

  const handleBulkSchedule = () => {
    if (selectedOrderIds.size === 0) return;
    const ids = Array.from(selectedOrderIds);
    const ordersToSchedule = orders.filter((o) => ids.includes(o.orderId));
    const eligible = ordersToSchedule.filter(
      (o) => o.status === "ACCEPTED" && !o.selectedCourierName,
    );
    if (eligible.length === 0) {
      alert("No eligible orders selected for scheduling");
      return;
    }
    setBulkScheduleIds(eligible.map((o) => o.orderId));
    openShippingModal(eligible[0]);
  };

  // Infinite scroll logic
  const lastOrderElementRef = useCallback(
    (node) => {
      if (loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setLoadingMore(true);
          setCurrentPage((prev) => prev + 1);
          fetchOrders(true);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loadingMore, hasMore],
  );

  // Load more on page change (but since backend doesn't support pagination, this is simulated by appending all, but for large data, backend should be updated)
  useEffect(() => {
    if (loadingMore) {
      // Simulate appending, but in reality, backend needs pagination params
      // For now, since all data is fetched, we can slice client-side
      const allFiltered = filteredOrders; // Wait, this is circular
      // Actually, since backend fetches all, infinite scroll client-side slicing
      // Wait, to make it work, better to slice filteredOrders for display
    }
  }, [currentPage]);

  // Better: since backend fetches all, use client-side infinite scroll by slicing
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(0, currentPage * itemsPerPage);
  const showLoadMore = paginatedOrders.length < filteredOrders.length;
  const bulkScheduleCount = bulkScheduleIds.length ? bulkScheduleIds.length : 1;
  const requiredWalletAmount =
    shippingPaymentMethod === "PREPAID"
      ? getRequiredWalletAmount(bulkScheduleCount)
      : 0;
  const hasInsufficientBalance =
    shippingPaymentMethod === "PREPAID" && walletBalance < requiredWalletAmount;

  const loadMore = () => {
    if (showLoadMore && !loadingMore) {
      setLoadingMore(true);
      setTimeout(() => {
        setCurrentPage((prev) => prev + 1);
        setLoadingMore(false);
      }, 500); // Simulate delay
    }
  };

  const handleScroll = useCallback(() => {
    if (loadMoreRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = loadMoreRef.current;
      if (
        scrollTop + clientHeight >= scrollHeight - 5 &&
        showLoadMore &&
        !loadingMore
      ) {
        loadMore();
      }
    }
  }, [showLoadMore, loadingMore, loadMore]);

  useEffect(() => {
    const container = loadMoreRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  const exportOrders = () => {
    const csv = [
      "Order ID,Date,Total,Payment Method,Status",
      ...filteredOrders.map(
        (o) =>
          `${o.orderId},${new Date(o.orderDate).toLocaleDateString()},${o.totalOrderValue},${
            o.paymentMethod
          },${o.status}`,
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-orders.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const calculateOrderValue = (order) => {
    const items = order.orderItems || [];
    const itemsTotal = items.reduce(
      (sum, it) => sum + Number(it.units || 0) * Number(it.unitPrice || 0),
      0,
    );
    const taxTotal = items.reduce((sum, it) => {
      const lineTotal = Number(it.units || 0) * Number(it.unitPrice || 0);
      return sum + (Number(it.tax || 0) / 100) * lineTotal;
    }, 0);
    const total = itemsTotal + taxTotal;
    return total > 0 ? total : Number(order.totalOrderValue || 0);
  };

  const normalizeShippingOptions = (raw) => {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.data?.serviceable_courier_list)) {
      return raw.data.serviceable_courier_list;
    }
    if (Array.isArray(raw?.serviceable_courier_list)) {
      return raw.serviceable_courier_list;
    }
    if (Array.isArray(raw?.available_couriers)) return raw.available_couriers;
    return [];
  };

  const fetchShippingOptions = async (order) => {
    if (!order?.pickupAddressName) {
      throw new Error("Pickup address is missing for this order");
    }
    if (!order?.shippingAddress?.pinCode) {
      throw new Error("Delivery pincode is missing for this order");
    }
    const weight = Number(order?.packageDetails?.packageWeight || 0);
    if (!weight || weight <= 0) {
      throw new Error("Package weight is missing for this order");
    }

    const pickupRes = await fetch(
      `${API_BASE_URL}/fetchPickupLocationPicode?addressName=${encodeURIComponent(order.pickupAddressName)}`,
      { method: "GET", credentials: "include" },
    );
    const pickupData = await pickupRes.json();
    if (!pickupRes.ok || !pickupData?.status) {
      throw new Error(pickupData?.message || "Failed to fetch pickup pincode");
    }

    const orderValue = calculateOrderValue(order);
    const rateRes = await fetch(`${API_BASE_URL}/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Pickup_pincode: pickupData.data?.pincode,
        Delivery_pincode: String(order.shippingAddress.pinCode),
        cod: false,
        total_order_value: Math.round(orderValue),
        weight,
      }),
    });

    const rateData = await rateRes.json();
    if (!rateRes.ok) {
      throw new Error(rateData?.error || "Shipping calculation failed");
    }

    const options = normalizeShippingOptions(rateData);
    if (!Array.isArray(options)) {
      throw new Error("Unexpected courier options format");
    }
    if (options.length === 0 && (rateData?.message || rateData?.error)) {
      throw new Error(rateData?.message || rateData?.error);
    }
    return options;
  };

  const openShippingModal = async (order) => {
    if (order.status !== "ACCEPTED") {
      return;
    }
    setShippingModalOrder(order);
    setShippingOptions([]);
    setShippingError(null);
    setShippingPaymentMethod("");
    setSelectedShippingOption(null);
    setShippingLoading(true);
    try {
      const options = await fetchShippingOptions(order);
      setShippingOptions(options || []);
    } catch (err) {
      setShippingError(err.message || "Failed to fetch shipping options");
    } finally {
      setShippingLoading(false);
    }
  };

  const closeShippingModal = () => {
    setShippingModalOrder(null);
    setShippingOptions([]);
    setShippingError(null);
    setShippingPaymentMethod("");
    setSelectedShippingOption(null);
  };

  const handlePickCourier = (item) => {
    setSelectedShippingOption(item);
    setShippingError(null);
  };

  function getRequiredWalletAmount(count = 1) {
    const charge = Number(
      selectedShippingOption?.total_Price_GST_Included || 0,
    );
    return charge * count;
  }

  const applyWalletBalanceFromResponse = (data) => {
    const nextBalance =
      data?.wallet_balance ??
      data?.walletBalance ??
      data?.wallet?.balance ??
      null;
    if (nextBalance !== null && nextBalance !== undefined) {
      setWalletBalance(Number(nextBalance) || 0);
    }
  };

  const handleGenerateLabel = async (order) => {
    const orderId = order?.orderId;
    if (!orderId) return;
    const existingLabel = getLabelUrl(order);
    if (existingLabel) {
      window.open(existingLabel, "_blank");
      return;
    }
    setLabelLoading((prev) => ({ ...prev, [orderId]: true }));
    try {
      const endpoints = [
        // try refresh to pull latest from RapidShyp into DB
        {
          url: `${API_BASE_URL}/orders/${getOrderIdForApi(orderId)}/refresh-label`,
          method: "POST",
        },
        {
          url: `${API_BASE_URL}/orders/${getOrderIdForApi(orderId)}/label`,
          method: "GET",
        },
        // legacy generate if backend supports it
        {
          url: `${API_BASE_URL}/orders/${getOrderIdForApi(orderId)}/generate-label`,
          method: "POST",
        },
      ];

      let lastError = null;
      for (const endpoint of endpoints) {
        const res = await fetch(endpoint.url, {
          method: endpoint.method,
          credentials: "include",
        });

        const contentType = res.headers.get("content-type") || "";
        if (!res.ok) {
          let errMsg = `Failed to generate label (HTTP ${res.status})`;
          try {
            const errData = await res.json();
            errMsg = errData?.message || errData?.error || errMsg;
          } catch (err) {
            // ignore JSON parse error
          }
          lastError = errMsg;
          continue;
        }

        if (contentType.includes("application/pdf")) {
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `label-${orderId}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
          return;
        }

        const data = await res.json().catch(() => null);
        if (data?.labelUrl) {
          window.open(data.labelUrl, "_blank");
          return;
        }
        if (data?.pdfBase64) {
          const byteCharacters = atob(data.pdfBase64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i += 1) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const blob = new Blob([new Uint8Array(byteNumbers)], {
            type: "application/pdf",
          });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `label-${orderId}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
          return;
        }
        if (data?.message) {
          lastError = data.message;
        } else {
          lastError = "Failed to generate label";
        }
      }

      throw new Error(lastError || "Failed to generate label");
    } catch (err) {
      alert(err.message || "Failed to generate label");
    } finally {
      setLabelLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleScheduleOrder = async (order) => {
    if (!selectedShippingOption) {
      setShippingError("Please select courier service first");
      return;
    }
    if (!shippingPaymentMethod) {
      setShippingError("Please select payment method");
      return;
    }
    const targetIds = bulkScheduleIds.length
      ? bulkScheduleIds
      : [order.orderId];
    if (shippingPaymentMethod === "PREPAID") {
      const requiredAmount = getRequiredWalletAmount(targetIds.length);
      if (walletBalance < requiredAmount) {
        setShippingError("Insufficient wallet balance");
        return;
      }
    }
    setShippingLoading(true);
    setShippingError(null);
    try {
      const results = await Promise.allSettled(
        targetIds.map(async (orderId) => {
          const res = await fetch(
            `${API_BASE_URL}/orders/${getOrderIdForApi(orderId)}/schedule`,
            {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                selectShippingCharges: Number(
                  selectedShippingOption.total_Price_GST_Included,
                ),
                selectedCourierName: selectedShippingOption.courier_name,
                selectedFreightMode: selectedShippingOption.freight_mode,
                paymentMethod: shippingPaymentMethod,
                courier_code: selectedShippingOption.courier_code || "",
              }),
            },
          );
          const rawText = await res.text();
          let data = null;
          try {
            data = rawText ? JSON.parse(rawText) : null;
          } catch (err) {
            // keep data as null
          }
          if (!res.ok || !data?.status) {
            const rawMsg =
              data?.message ||
              data?.Message ||
              rawText ||
              "Scheduling failed. Please try again or contact support.";
            const details = data?.details || data?.data;
            const combined =
              typeof details === "string" && details
                ? `${rawMsg} (${details})`
                : rawMsg;
            const lower = combined.toLowerCase();
            let friendly = combined;
            if (lower.includes("insufficient wallet balance")) {
              friendly =
                "Insufficient wallet balance. Please recharge and try again.";
            } else if (lower.includes("courier_code is required")) {
              friendly = "Courier selection is missing. Please re-select courier.";
            } else if (lower.includes("only accepted orders can be scheduled")) {
              friendly = "Only accepted orders can be scheduled.";
            } else if (lower.includes("failed to fetch order info")) {
              friendly =
                "We couldn't fetch order info from Rapidshyp. Please try again shortly.";
            } else if (lower.includes("failed to assign awb")) {
              friendly =
                "AWB could not be assigned. Please try again later or contact support.";
            } else if (lower.includes("failed to schedule pickup")) {
              friendly =
                "Pickup scheduling failed. Please try again later.";
            }
            throw new Error(friendly);
          }
          applyWalletBalanceFromResponse(data);
          return data;
        }),
      );

      const baseUpdated = {
        selectShippingCharges: Number(
          selectedShippingOption.total_Price_GST_Included,
        ),
        selectedCourierName: selectedShippingOption.courier_name,
        selectedFreightMode: selectedShippingOption.freight_mode,
        paymentMethod: shippingPaymentMethod,
      };

      const successIds = results
        .map((r, i) => (r.status === "fulfilled" ? targetIds[i] : null))
        .filter(Boolean);

      if (successIds.length > 0) {
        const perIdUpdates = {};
        results.forEach((r, idx) => {
          if (r.status !== "fulfilled") return;
          const orderId = targetIds[idx];
          const payload =
            r.value?.order || r.value?.data || r.value?.updatedOrder || null;
          const awb = r.value?.awb || payload?.awb || "";
          const label =
            r.value?.labelUrl ||
            r.value?.label_url ||
            payload?.labelUrl ||
            payload?.label_url ||
            "";
          perIdUpdates[orderId] = {
            ...baseUpdated,
            ...(payload || {}),
            ...(awb ? { awbNumber: awb } : {}),
            ...(label ? { labelUrl: label } : {}),
          };
        });

        setOrders((prev) =>
          prev.map((o) =>
            successIds.includes(o.orderId)
              ? { ...o, ...perIdUpdates[o.orderId] }
              : o,
          ),
        );
        setFilteredOrders((prev) =>
          prev.map((o) =>
            successIds.includes(o.orderId)
              ? { ...o, ...perIdUpdates[o.orderId] }
              : o,
          ),
        );
        setSelectedOrder((prev) =>
          prev && successIds.includes(prev.orderId)
            ? { ...prev, ...perIdUpdates[prev.orderId] }
            : prev,
        );
      }

      const failed = results.filter((r) => r.status === "rejected");
      if (failed.length > 0) {
        const firstError = failed[0]?.reason?.message;
        setShippingError(firstError || `${failed.length} orders failed to schedule`);
      } else {
        closeShippingModal();
      }
      setSelectedOrderIds(new Set());
      setBulkScheduleIds([]);
    } catch (err) {
      setShippingError(err.message || "Failed to save delivery service");
    } finally {
      setShippingLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (confirm(`Are you sure you want to cancel order ${orderId}?`)) {
      try {
        // Update status to REJECTED (assuming cancellation maps to REJECTED)
        const res = await fetch(
          `${API_BASE_URL}/orders/${orderId}/update-status`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "REJECTED" }),
            credentials: "include",
          },
        );

        if (res.ok) {
          // Update local state
          setOrders((prev) =>
            prev.map((o) =>
              o.orderId === orderId ? { ...o, status: "REJECTED" } : o,
            ),
          );
          setFilteredOrders((prev) =>
            prev.map((o) =>
              o.orderId === orderId ? { ...o, status: "REJECTED" } : o,
            ),
          );
          alert("Order cancelled successfully");
        } else {
          const errData = await res.json();
          alert(`Failed to cancel: ${errData.message || "Unknown error"}`);
        }
      } catch (err) {
        alert("Network error cancelling order");
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center">Please log in to view your orders.</div>
    );
  }

  return (
    <div className="max-w-7xl text-black mx-auto p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className=""
      >
        <div className="flex flex-wrap gap-3 justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">
            My Orders ({filteredOrders.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleBulkStatus("ACCEPTED")}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-60"
              disabled={selectedOrderIds.size === 0 || bulkStatusLoading || hasNonPendingSelection}
              title="Approve Selected"
            >
              Approve Selected
            </button>
            <button
              onClick={() => handleBulkStatus("REJECTED")}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-60"
              disabled={selectedOrderIds.size === 0 || bulkStatusLoading || hasNonPendingSelection}
              title="Cancel Selected (PENDING only)"
            >
              Cancel Selected
            </button>
            <button
              onClick={handleBulkSchedule}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-60"
              disabled={selectedOrderIds.size === 0 || bulkScheduleLoading || hasScheduledSelection}
              title="Schedule Selected (unscheduled only)"
            >
              Schedule Selected
            </button>
            <button
              onClick={() => {
                setCurrentPage(1);
                fetchOrders();
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              title="Refresh Orders"
            >
              <RefreshCw size={16} /> Refresh
            </button>
            <button
              onClick={exportOrders}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-red-500">!</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="grid md:grid-cols-5 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-3 text-gray-400"
              />
              <input
                type="text"
                placeholder="Order ID / Item"
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
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">All</option>
              {validStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Payment</label>
            <select
              value={filters.paymentMethod}
              onChange={(e) =>
                handleFilterChange("paymentMethod", e.target.value)
              }
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">All</option>
              <option value="PREPAID">Prepaid</option>
              <option value="COD">COD</option>
            </select>
          </div>
        </div>

        {/* Orders Table with Infinite Scroll */}
        <div
          ref={loadMoreRef}
          className="overflow-x-auto max-h-[70vh] overflow-y-auto"
        >
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 sticky top-0">
                <th className="border p-3 text-left text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={
                      paginatedOrders.length > 0 &&
                      paginatedOrders.every((o) => selectedOrderIds.has(o.orderId))
                    }
                    onChange={toggleSelectAllVisible}
                  />
                </th>
                <th className="border p-3 text-left text-sm font-medium">
                  Order ID
                </th>
                <th className="border p-3 text-left text-sm font-medium">
                  Date
                </th>
                <th className="border p-3 text-left text-sm font-medium">
                  Item
                </th>
                <th className="border p-3 text-right text-sm font-medium">
                  Total (₹)
                </th>
                <th className="border p-3 text-left text-sm font-medium">
                  Payment
                </th>
                <th className="border p-3 text-left text-sm font-medium">
                  Charge (₹)
                </th>
                <th className="border p-3 text-left text-sm font-medium">
                  Status
                </th>
                <th className="border p-3 text-left text-sm font-medium">
                  Courier
                </th>
                <th className="border p-3 text-left text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-4 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order, index) => (
                  <tr
                    key={order.orderId}
                    ref={
                      index === paginatedOrders.length - 1
                        ? lastOrderElementRef
                        : null
                    }
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="p-3 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedOrderIds.has(order.orderId)}
                        onChange={() => toggleSelectOne(order.orderId)}
                        disabled={order.status === "DELIVERED"}
                      />
                    </td>
                    <td className="p-3 text-sm font-medium">{order.orderId}</td>
                    <td className="p-3 text-sm">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-sm">
                      {order.orderItems?.[0]?.itemName || "—"}
                    </td>
                    <td className="p-3 text-right text-sm">
                      ₹{Number(order.totalOrderValue).toFixed(2)}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          getDisplayPaymentMethod(order) === "PREPAID"
                            ? "bg-blue-100 text-blue-800"
                            : getDisplayPaymentMethod(order) === "COD"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {getDisplayPaymentMethod(order)}
                      </span>
                    </td>
                    <td className="p-3 text-center text-sm">
                      ₹{Number(order.selectShippingCharges).toFixed(2)}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          order.status === "DELIVERED"
                            ? "bg-green-100 text-green-800"
                            : order.status === "ON_WAY"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "ACCEPTED"
                                ? "bg-purple-100 text-purple-800"
                                : order.status === "REJECTED"
                                  ? "bg-red-100 text-red-800"
                                  : order.status === "RTO"
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3 text-sm">
                      {order.selectedCourierName || "—"}
                      {getAwbNumber(order) ? (
                        <div className="text-xs text-gray-500">
                          AWB: {getAwbNumber(order)}
                        </div>
                      ) : null}
                    </td>
                    <td className="p-3 text-sm">
                      <div className="flex gap-2">
                        {order.status === "PENDING" && !order.selectedCourierName && (
                          <button
                            onClick={() => handleApproveOne(order.orderId)}
                            className="text-emerald-600 hover:text-emerald-800 p-1"
                            title="Approve Order"
                          >
                            Approve
                          </button>
                        )}
                        {order.status === "PENDING" && !order.selectedCourierName && (
                          <button
                            onClick={() => handleCancelOne(order.orderId)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Cancel Order"
                          >
                            <X size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="text-blue-500 hover:text-blue-700 p-1"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {order.selectedCourierName && (
                          <button
                            onClick={() => handleGenerateLabel(order)}
                            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                            title="Generate Label"
                            disabled={labelLoading[order.orderId]}
                          >
                            <Download size={14} />
                            {labelLoading[order.orderId]
                              ? "Generating..."
                              : "Label"}
                          </button>
                        )}
                        {order.status === "ACCEPTED" &&
                          !order.selectedCourierName && (
                            <button
                              onClick={() => openShippingModal(order)}
                              className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800 text-xs font-medium"
                              title="Schedule Order"
                            >
                              <Calendar size={14} />
                              Schedule
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {loadingMore && (
                <tr>
                  <td colSpan={10} className="p-4 text-center">
                    Loading more orders...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* {!loading && filteredOrders.length > 0 && !loadingMore && paginatedOrders.length >= filteredOrders.length && (
          <div className="text-center py-4 text-gray-500">
            All orders loaded
          </div>
        )} */}
      </motion.div>

      {/* Modal for Full Details */}
      {showModal && selectedOrder && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  Order Details #{selectedOrder.orderId}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mb-1">
                      <Calendar className="h-4 w-4" />
                      Order Date
                    </p>
                    <p className="text-lg font-semibold">
                      {new Date(selectedOrder.orderDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-green-600">
                      ₹{Number(selectedOrder.totalOrderValue).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {getDisplayPaymentMethod(selectedOrder)}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Status</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedOrder.status === "DELIVERED"
                        ? "bg-green-100 text-green-800"
                        : selectedOrder.status === "ON_WAY"
                          ? "bg-blue-100 text-blue-800"
                          : selectedOrder.status === "ACCEPTED"
                            ? "bg-purple-100 text-purple-800"
                            : selectedOrder.status === "REJECTED"
                              ? "bg-red-100 text-red-800"
                              : selectedOrder.status === "RTO"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Shipping Address</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>
                        {selectedOrder.shippingAddress?.firstName || "—"}{" "}
                        {selectedOrder.shippingAddress?.lastName || ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{selectedOrder.shippingAddress?.phone || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>
                        {selectedOrder.shippingAddress?.addressLine1 || "—"},{" "}
                        {selectedOrder.shippingAddress?.addressLine2 || ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>
                        {selectedOrder.shippingAddress?.city || "—"},{" "}
                        {selectedOrder.shippingAddress?.state || ""} -{" "}
                        {selectedOrder.shippingAddress?.pinCode || "—"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Pickup Address</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{selectedOrder.pickupAddressName || "—"}</span>
                  </div>
                </div>
                {selectedOrder.selectedCourierName ? (
                  <div>
                    <h3 className="font-semibold mb-3">Courier Details</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Package className="h-4 w-4" />
                      Shipped Via {selectedOrder.selectedCourierName} ₹
                      {Number(selectedOrder.selectShippingCharges).toFixed(2)} (
                      {selectedOrder.selectedFreightMode})
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      AWB: {getAwbNumber(selectedOrder) || "N/A"}
                    </div>
                    <button
                      onClick={() => handleGenerateLabel(selectedOrder)}
                      className="mt-3 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      disabled={labelLoading[selectedOrder.orderId]}
                    >
                      <Download size={16} />
                      {labelLoading[selectedOrder.orderId]
                        ? "Generating label..."
                        : "Generate Label"}
                    </button>
                  </div>
                ) : selectedOrder.status === "ACCEPTED" ? (
                  <div>
                    <h3 className="font-semibold mb-3">Courier Details</h3>
                    <button
                      onClick={() => openShippingModal(selectedOrder)}
                      className="text-emerald-600 hover:text-emerald-800 underline text-sm"
                    >
                      Schedule Order
                    </button>
                  </div>
                ) : null}

                <div>
                  <h3 className="font-semibold mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.orderItems?.map((item, idx) => (
                      <div key={idx} className="border rounded-lg p-3">
                        <p className="font-medium">{item.itemName}</p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.units} × ₹
                          {Number(item.unitPrice).toFixed(2)} = ₹
                          {Number(item.units * item.unitPrice).toFixed(2)}
                        </p>
                      </div>
                    )) || <p className="text-sm text-gray-500">No items</p>}
                  </div>
                </div>

                {selectedOrder.packageDetails && (
                  <div>
                    <h3 className="font-semibold mb-3">Package Details</h3>
                    <div className="p-3 bg-gray-50 rounded-lg text-sm">
                      <p>
                        Dimensions: {selectedOrder.packageDetails.packageLength}
                        ×{selectedOrder.packageDetails.packageBreadth}×
                        {selectedOrder.packageDetails.packageHeight} cm
                      </p>
                      <p>
                        Weight: {selectedOrder.packageDetails.packageWeight} kg
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {shippingModalOrder && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeShippingModal}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Schedule Order</h2>
                <button
                  onClick={closeShippingModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={22} />
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                {bulkScheduleIds.length > 0
                  ? `Bulk scheduling ${bulkScheduleIds.length} orders`
                  : `Order ID: ${shippingModalOrder.orderId}`}
              </p>
              {bulkScheduleIds.length > 0 && (
                <p className="text-xs text-amber-600 mb-4">
                  The selected courier and payment method will be applied to all
                  selected orders.
                </p>
              )}

              {shippingError && (
                <div className="bg-red-50 text-red-700 rounded-xl p-3 mb-4">
                  {shippingError}
                </div>
              )}

              {shippingLoading ? (
                <div className="text-sm text-gray-500">
                  Loading courier options...
                </div>
              ) : shippingOptions.length === 0 ? (
                <div className="text-sm text-gray-500">
                  No courier options available.
                </div>
              ) : (
                <div className="space-y-3">
                  {shippingOptions.map((item, idx) => {
                    const isSelected =
                      selectedShippingOption &&
                      selectedShippingOption.courier_name ===
                        item.courier_name &&
                      selectedShippingOption.freight_mode === item.freight_mode;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between border rounded-xl p-3 ${
                          isSelected ? "border-emerald-500 bg-emerald-50" : ""
                        }`}
                      >
                        <div>
                          <div className="text-sm font-semibold">
                            {item.courier_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.freight_mode}
                          </div>
                        </div>
                        <div className="text-sm font-medium text-green-600">
                          ₹{Number(item.total_Price_GST_Included).toFixed(2)}
                        </div>
                        <button
                          onClick={() => handlePickCourier(item)}
                          className={`px-3 py-1 rounded-lg text-xs ${
                            isSelected
                              ? "bg-emerald-600 text-white"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                          disabled={shippingLoading}
                        >
                          {isSelected ? "Selected" : "Select"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedShippingOption && (
                <div className="mt-5">
                  <div className="text-sm text-gray-600 mb-2">
                    Selected: {selectedShippingOption.courier_name} (
                    {selectedShippingOption.freight_mode})
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    Wallet balance: ₹{Number(walletBalance || 0).toFixed(2)}
                  </div>
                  <label className="block text-sm font-medium mb-1">
                    Payment Method
                  </label>
                  <select
                    value={shippingPaymentMethod}
                    onChange={(e) => setShippingPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="">Select payment</option>
                    <option value="PREPAID">PREPAID</option>
                    <option value="COD">COD</option>
                  </select>

                  <button
                    onClick={() => handleScheduleOrder(shippingModalOrder)}
                    className="mt-4 w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700"
                    disabled={
                      shippingLoading || !shippingPaymentMethod || hasInsufficientBalance
                    }
                  >
                    Schedule Order
                  </button>
                  {shippingPaymentMethod === "PREPAID" && (
                    <div className="mt-2 text-xs text-gray-500">
                      Required: ₹{Number(requiredWalletAmount).toFixed(2)}
                    </div>
                  )}
                  {hasInsufficientBalance && (
                    <div className="mt-1 text-xs text-red-600">
                      Insufficient wallet balance
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default OnlyMyOrder;
