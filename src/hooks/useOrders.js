import { useState, useEffect } from 'react';
import { API_BASE_URL } from "@/utils/api";

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState({});
  const [selectedStatuses, setSelectedStatuses] = useState({});
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const validStatuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'ON_WAY', 'RTO', 'DELIVERED'];

  // Filter and paginate orders
  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'ALL' || order.status === filterStatus;
    const matchesSearch = order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.status?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/all-orders`, {
        method: 'GET',
      });

      if (res.ok) {
        const data = await res.json();
        console.log('Fetched orders:', data);
        
        setOrders(data.data || []);
        // Reset selected statuses to current order statuses
        const initialSelected = {};
        data.data.forEach(order => {
          initialSelected[order.orderId] = order.status || 'PENDING';
        });
        setSelectedStatuses(initialSelected);
        // Reset pagination on new fetch
        setCurrentPage(1);
      } else {
        setError(`Failed to fetch orders: ${res.status} - ${res.statusText}`);
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError('Network error fetching orders. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  // Update order status locally without full refetch, now including shipping charges
  const updateStatus = async (orderId, newStatus, selectShippingCharges) => {
    setUpdating((prev) => ({ ...prev, [orderId]: true }));
    try {
      // Assuming shippingCharges is a number; adjust as needed (e.g., if it's always sent or only for certain statuses)
      const payload = { status: newStatus };
      
      if (selectShippingCharges !== undefined && selectShippingCharges !== null) {
        payload.selectShippingCharges = selectShippingCharges;
        console.log(`bill payment:${selectShippingCharges}`); // Added the log here for bill/shipping amount
      }

      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/update-status`, {
        method: 'PATCH',
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
          
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        console.log('Status updated:', data);
        // Update local state instead of refetching
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.orderId === orderId ? { ...order, status: newStatus } : order
          )
        );
        // Update selected status
        setSelectedStatuses(prev => ({ ...prev, [orderId]: newStatus }));
        alert(`Status updated to ${newStatus} successfully!`);
      } else {
        let errData;
        try {
          errData = await res.json();
        } catch (jsonErr) {
          errData = { message: `HTTP ${res.status}: ${res.statusText}` };
        }
        console.error('Update error:', errData, 'Response status:', res.status);
        alert(`Failed to update: ${errData.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Update status error:', err);
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        alert('Network/CORS error: Check if backend is running on port 5000 and CORS is enabled. Open browser console for details.');
      } else {
        alert('Network error updating status');
      }
    } finally {
      setUpdating((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleStatusChange = (orderId, status) => {
    setSelectedStatuses(prev => ({ ...prev, [orderId]: status }));
  };

  const handleUpdateClick = (orderId) => {
    const newStatus = selectedStatuses[orderId];
    const currentOrder = orders.find(o => o.orderId === orderId);
    if (!currentOrder) {
      alert('Order not found.');
      return;
    }
    const currentStatus = currentOrder.status || 'PENDING';
    if (newStatus === currentStatus && currentStatus !== 'DELIVERED') {
      alert('No change selected.');
      return;
    }
    // Extract shippingCharges from the current order (assuming it exists in the order data)
    // If not, you may need to add a separate state/input for it, or default to 0
    const selectShippingCharges = currentOrder.selectShippingCharges || 0; // Adjust field name if different
    updateStatus(orderId, newStatus, selectShippingCharges);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    updating,
    selectedStatuses,
    isMobile: false, // Handled in component
    filterStatus,
    setFilterStatus,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    rowsPerPage,
    setRowsPerPage,
    validStatuses,
    filteredOrders,
    totalPages,
    paginatedOrders,
    handlePageChange,
    fetchOrders,
    handleStatusChange,
    handleUpdateClick,
    setOrders, // If needed elsewhere
  };
};
