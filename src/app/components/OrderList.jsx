import React from 'react';

const OrderList = ({
  paginatedOrders,
  selectedStatuses,
  updating,
  validStatuses,
  handleStatusChange,
  handleUpdateClick,
  isMobile,
  currentPage,
  totalPages,
  filteredOrders,
  rowsPerPage,
  setRowsPerPage,
  handlePageChange,
}) => {
  const renderTableView = () => (
    <table style={{ 
      width: '100%', 
      borderCollapse: 'collapse', 
      marginBottom: '20px',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      <thead>
        <tr style={{ backgroundColor: '#f8f9fa' }}>
          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Order ID</th>
          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Status</th>
          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Total Value</th>
          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Shipping Charges</th>
          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Date</th>
          {/* <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Actions</th> */}
        </tr>
      </thead>
      <tbody>
        {paginatedOrders.map((order) => (
          <tr key={order.orderId} style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '12px' }}>{order.orderId}</td>
            <td style={{ padding: '12px' }}>
              <span style={{ color: '#28a745', fontWeight: 'bold' }}>{order.status || 'PENDING'}</span>
            </td>
            <td style={{ padding: '12px' }}>₹{order.totalOrderValue}</td>
            <td style={{ padding: '12px' }}>₹{order.selectShippingCharges}</td>
            <td style={{ padding: '12px' }}>{new Date(order.orderDate).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderCardView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {paginatedOrders.map((order) => (
        <div
          key={order.orderId}
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '15px',
            backgroundColor: '#f9f9f9',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <h3 style={{ margin: '0 0 10px 0', color: '#007bff', fontSize: '1.2rem' }}>Order ID: {order.orderId}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
            <p><strong>Current Status:</strong> <span style={{ color: '#28a745', fontWeight: 'bold' }}>{order.status || 'PENDING'}</span></p>
            <p><strong>Total Value:</strong> ₹{order.totalOrderValue}</p>
            <p><strong>Date:</strong> {new Date(order.orderDate).toLocaleDateString()}</p>
          </div>
          <p style={{ marginTop: '10px', color: '#6c757d', fontSize: '12px' }}>
            Status updates disabled for admin
          </p>
        </div>
      ))}
    </div>
  );

  const renderPagination = () => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      gap: '10px', 
      marginTop: '20px',
      flexWrap: 'wrap'
    }}>
      <button
        onClick={() => handlePageChange(1)}
        disabled={currentPage === 1}
        style={{
          padding: '8px 12px',
          background: currentPage === 1 ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
        }}
      >
        First
      </button>
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          padding: '8px 12px',
          background: currentPage === 1 ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
        }}
      >
        Prev
      </button>
      <span style={{ padding: '8px' }}>
        Page {currentPage} of {totalPages} ({filteredOrders.length} total)
      </span>
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          padding: '8px 12px',
          background: currentPage === totalPages ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
        }}
      >
        Next
      </button>
      <button
        onClick={() => handlePageChange(totalPages)}
        disabled={currentPage === totalPages}
        style={{
          padding: '8px 12px',
          background: currentPage === totalPages ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
        }}
      >
        Last
      </button>
      <select
        value={rowsPerPage}
        onChange={(e) => {
          setRowsPerPage(parseInt(e.target.value));
          handlePageChange(1);
        }}
        style={{ padding: '6px' }}
      >
        <option value={10}>10 per page</option>
        <option value={20}>20 per page</option>
        <option value={50}>50 per page</option>
        <option value={100}>100 per page</option>
      </select>
    </div>
  );

  if (!isMobile) {
    return (
      <>
        {renderTableView()}
        {renderPagination()}
      </>
    );
  }

  return (
    <>
      {renderCardView()}
      {renderPagination()}
    </>
  );
};

export default OrderList;
