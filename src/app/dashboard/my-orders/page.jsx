"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Download, Eye, X, Package, Calendar, User, Phone, MapPin, RefreshCw } from "lucide-react";
import { useAuth } from "../../../utils/checkAuth"; // Adjust path as needed

const OnlyMyOrder = () => {
  const { user, loading: authLoading } = useAuth();
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
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const itemsPerPage = 20; // Adjust as needed for performance
  const observer = useRef(null);
  const loadMoreRef = useRef(null);

  // Valid statuses matching backend
  const validStatuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'ON_WAY', 'RTO', 'DELIVERED'];

  // Fetch orders
  const fetchOrders = async (append = false) => {
    if (!user) return;
    setLoading(!append);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/user-orders', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await res.json();
      console.log('Fetched user orders:', data);

      if (res.ok && data.status) {
        const newOrders = data.data || [];
        if (append) {
          setOrders(prev => [...prev, ...newOrders]);
          setFilteredOrders(prev => [...prev, ...newOrders]);
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
  },[filters]);

  // Filter orders based on user input
  useEffect(() => {
    let filtered = orders;
    if (filters.search) {
      filtered = filtered.filter(
        (o) =>
          o.orderId.toString().toLowerCase().includes(filters.search.toLowerCase()) ||
          o.orderItems?.[0]?.itemName?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    if (filters.dateFrom) {
      filtered = filtered.filter((o) => new Date(o.orderDate) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      filtered = filtered.filter((o) => new Date(o.orderDate) <= new Date(filters.dateTo));
    }
    if (filters.status) {
      filtered = filtered.filter((o) => o.status === filters.status);
    }
    if (filters.paymentMethod) {
      filtered = filtered.filter((o) => o.paymentMethod === filters.paymentMethod);
    }
    setFilteredOrders(filtered);
  }, [filters, orders]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Infinite scroll logic
  const lastOrderElementRef = useCallback(node => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setLoadingMore(true);
        setCurrentPage(prev => prev + 1);
        fetchOrders(true);
      }
    });
    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore]);

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

  const loadMore = () => {
    if (showLoadMore && !loadingMore) {
      setLoadingMore(true);
      setTimeout(() => {
        setCurrentPage(prev => prev + 1);
        setLoadingMore(false);
      }, 500); // Simulate delay
    }
  };

  const handleScroll = useCallback(() => {
    if (loadMoreRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = loadMoreRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 5 && showLoadMore && !loadingMore) {
        loadMore();
      }
    }
  }, [showLoadMore, loadingMore, loadMore]);

  useEffect(() => {
    const container = loadMoreRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const exportOrders = () => {
    const csv = [
      "Order ID,Date,Total,Payment Method,Status",
      ...filteredOrders.map(
        (o) =>
          `${o.orderId},${new Date(o.orderDate).toLocaleDateString()},${o.totalOrderValue},${
            o.paymentMethod
          },${o.status}`
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-orders.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleCancelOrder = async (orderId) => {
    if (confirm(`Are you sure you want to cancel order ${orderId}?`)) {
      try {
        // Update status to REJECTED (assuming cancellation maps to REJECTED)
        const res = await fetch(`http://localhost:5000/orders/${orderId}/update-status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'REJECTED' }),
          credentials: 'include',
        });

        if (res.ok) {
          // Update local state
          setOrders((prev) =>
            prev.map((o) => (o.orderId === orderId ? { ...o, status: 'REJECTED' } : o))
          );
          setFilteredOrders((prev) =>
            prev.map((o) => (o.orderId === orderId ? { ...o, status: 'REJECTED' } : o))
          );
          alert('Order cancelled successfully');
        } else {
          const errData = await res.json();
          alert(`Failed to cancel: ${errData.message || 'Unknown error'}`);
        }
      } catch (err) {
        alert('Network error cancelling order');
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
    return <div className="text-center">Please log in to view your orders.</div>;
  }
  
  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="bg-white rounded-2xl shadow p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">My Orders ({filteredOrders.length})</h2>
          <div className="flex gap-2">
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
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Order ID / Item"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">To Date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
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
              onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">All</option>
              <option value="PREPAID">Prepaid</option>
              <option value="COD">COD</option>
            </select>
          </div>
        </div>

        {/* Orders Table with Infinite Scroll */}
        <div ref={loadMoreRef} className="overflow-x-auto max-h-[70vh] overflow-y-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 sticky top-0">
                <th className="border p-3 text-left text-sm font-medium">Order ID</th>
                <th className="border p-3 text-left text-sm font-medium">Date</th>
                <th className="border p-3 text-left text-sm font-medium">Item</th>
                <th className="border p-3 text-right text-sm font-medium">Total (₹)</th>
                <th className="border p-3 text-left text-sm font-medium">Payment</th>
                <th className="border p-3 text-left text-sm font-medium">Charge (₹)</th>
                <th className="border p-3 text-left text-sm font-medium">Status</th>
                <th className="border p-3 text-left text-sm font-medium">Courier</th>
                <th className="border p-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-4 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order, index) => (
                  <tr 
                    key={order.orderId} 
                    ref={index === paginatedOrders.length - 1 ? lastOrderElementRef : null}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="p-3 text-sm font-medium">{order.orderId}</td>
                    <td className="p-3 text-sm">{new Date(order.orderDate).toLocaleDateString()}</td>
                    <td className="p-3 text-sm">{order.orderItems?.[0]?.itemName || '—'}</td>
                    <td className="p-3 text-right text-sm">₹{Number(order.totalOrderValue).toFixed(2)}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          order.paymentMethod === 'PREPAID'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3 text-center text-sm">₹{Number(order.selectShippingCharges).toFixed(2)}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          order.status === 'DELIVERED'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'ON_WAY'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'ACCEPTED'
                            ? 'bg-purple-100 text-purple-800'
                            : order.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : order.status === 'RTO'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3 text-sm">{order.selectedCourierName || '—'}</td>
                    <td className="p-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCancelOrder(order.orderId)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Cancel Order"
                          disabled={order.status !== 'PENDING'}
                        >
                          <X size={16} />
                        </button>
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="text-blue-500 hover:text-blue-700 p-1"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {loadingMore && (
                <tr>
                  <td colSpan={9} className="p-4 text-center">
                    Loading more orders...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {!loading && filteredOrders.length > 0 && !loadingMore && paginatedOrders.length >= filteredOrders.length && (
          <div className="text-center py-4 text-gray-500">
            All orders loaded
          </div>
        )}
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
                <h2 className="text-2xl font-bold">Order Details #{selectedOrder.orderId}</h2>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
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
                    <p className="text-lg font-semibold">{new Date(selectedOrder.orderDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-green-600">₹{Number(selectedOrder.totalOrderValue).toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{selectedOrder.paymentMethod}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Status</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedOrder.status === 'DELIVERED'
                        ? 'bg-green-100 text-green-800'
                        : selectedOrder.status === 'ON_WAY'
                        ? 'bg-blue-100 text-blue-800'
                        : selectedOrder.status === 'ACCEPTED'
                        ? 'bg-purple-100 text-purple-800'
                        : selectedOrder.status === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : selectedOrder.status === 'RTO'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-yellow-100 text-yellow-800'
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
                        {selectedOrder.shippingAddress?.firstName || '—'}{' '}
                        {selectedOrder.shippingAddress?.lastName || ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{selectedOrder.shippingAddress?.phone || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>
                        {selectedOrder.shippingAddress?.addressLine1 || '—'},{' '}
                        {selectedOrder.shippingAddress?.addressLine2 || ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>
                        {selectedOrder.shippingAddress?.city || '—'}, {selectedOrder.shippingAddress?.state || ''} -{' '}
                        {selectedOrder.shippingAddress?.pinCode || '—'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Pickup Address</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{selectedOrder.pickupAddressName || '—'}</span>
                  </div>
                </div>

                {selectedOrder.selectedCourierName && (
                  <div>
                    <h3 className="font-semibold mb-3">Courier Details</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Package className="h-4 w-4" />
                      Shipped via: {selectedOrder.selectedCourierName} 
                      ₹{selectedOrder.selectShippingCharges} (
                      {selectedOrder.selectedFreightMode})
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.orderItems?.map((item, idx) => (
                      <div key={idx} className="border rounded-lg p-3">
                        <p className="font-medium">{item.itemName}</p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.units} × ₹{Number(item.unitPrice).toFixed(2)} = ₹
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
                        Dimensions: {selectedOrder.packageDetails.packageLength}×{selectedOrder.packageDetails.packageBreadth}
                        ×{selectedOrder.packageDetails.packageHeight} cm
                      </p>
                      <p>Weight: {selectedOrder.packageDetails.packageWeight} kg</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default OnlyMyOrder;