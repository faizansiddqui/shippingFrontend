"use client"
import React, { useState, useEffect } from 'react';
import { useOrders } from '../../hooks/useOrders';
import OrderList from '../components/OrderList';

const OrdersPage = () => {
  const {
    orders,
    loading,
    error,
    updating,
    selectedStatuses,
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
  } = useOrders();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const containerPadding = isMobile ? '10px' : '20px';
  const fontSizeH1 = isMobile ? '1.5rem' : '2rem';

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        padding: containerPadding,
        fontSize: isMobile ? '1rem' : '1.2rem'
      }}>
        Loading orders...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: containerPadding, 
        color: 'red',
        fontSize: isMobile ? '1rem' : '1.2rem'
      }}>
        Error: {error}
        <br />
        <button
          onClick={fetchOrders}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry Fetch
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: containerPadding, 
      maxWidth: '100%', 
      margin: '0 auto', 
      width: '100%',
      boxSizing: 'border-box',
      color: 'black',
      backgroundColor: '#ffffff',
    }}>
      <h1 style={{ 
        textAlign: 'center', 
        color: '#333', 
        fontSize: fontSizeH1, 
        marginBottom: '20px' 
      }}>
        All Orders Dashboard
      </h1>

      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row', 
        gap: '15px', 
        marginBottom: '20px', 
        alignItems: isMobile ? 'stretch' : 'center',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <input
          type="text"
          placeholder="Search by Order ID or Status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            minWidth: '150px'
          }}
        >
          <option value="ALL">All Statuses</option>
          {validStatuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <button
          onClick={fetchOrders}
          style={{
            padding: '10px 20px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          Refresh
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666', fontSize: isMobile ? '1rem' : '1.2rem' }}>
          No orders match the filters. Try adjusting filters or create new orders.
        </p>
      ) : (
        <OrderList
          paginatedOrders={ paginatedOrders }
          selectedStatuses={ selectedStatuses }
          updating={ updating }
          validStatuses={validStatuses}
          handleStatusChange={handleStatusChange}
          handleUpdateClick={handleUpdateClick}
          isMobile={isMobile}
          currentPage={currentPage}
          totalPages={totalPages}
          filteredOrders={filteredOrders}
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
          handlePageChange={handlePageChange}
        />

    
      )}



      {/* Note for scalability */}
      {orders.length > 100 && (
        <p style={{ 
          textAlign: 'center', 
          color: '#007bff', 
          fontSize: '0.9rem', 
          marginTop: '20px' 
        }}>
          Note: For 10k+ orders, consider backend pagination for better performance.
        </p>
      )}
    </div>
  );
};

export default OrdersPage;