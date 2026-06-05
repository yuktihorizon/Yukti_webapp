import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/admin/orders');
        setOrders(data);
      } catch (e) {
        console.error('Failed to fetch orders:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#d4d4d4';
      case 'processing': return '#a3a3a3';
      case 'shipped': return '#737373';
      case 'delivered': return '#171717';
      case 'cancelled': return '#000000';
      default: return '#9ca3af';
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">Loading orders...</div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div style={{ 
        maxWidth: 1200, 
        margin: '20px auto', 
        padding: '0 20px'
      }}>
        <div style={{ 
          background: 'white', 
          padding: '16px', 
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '16px',
          alignItems: 'center'
        }}>
          <input 
            type="text"
            placeholder="Search orders by customer name, email, or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '16px'
            }}
          />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '16px',
              minWidth: '150px'
            }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders */}
      <div style={{ 
        maxWidth: 1200, 
        margin: '0 auto', 
        padding: '0 20px 20px 20px'
      }}>
        {filteredOrders.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            color: '#666'
          }}>
            <h3>
              {searchTerm || statusFilter !== 'all' ? 'No orders found' : 'No orders yet'}
            </h3>
            <p>
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Orders will appear here once customers make purchases.'
              }
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {filteredOrders.map((order) => (
              <div key={order._id} style={{ 
                background: 'white', 
                borderRadius: '12px', 
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '16px'
                }}>
                  <div>
                    <h3 style={{ 
                      margin: '0 0 8px 0', 
                      color: '#333', 
                      fontSize: '1.2rem',
                      fontWeight: '600'
                    }}>
                      Order #{order.orderId}
                    </h3>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '16px',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{ color: '#666', fontSize: '0.9rem' }}>
                        {order.customerEmail}
                      </span>
                      <span style={{ color: '#666', fontSize: '0.9rem' }}>
                        {order.customerName}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontSize: '0.8rem',
                      color: '#666',
                      marginBottom: '8px'
                    }}>
                      {formatDate(order.createdAt)}
                    </div>
                    <span style={{ 
                      background: getStatusColor(order.status),
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '16px', 
                  borderRadius: '6px',
                  marginBottom: '16px'
                }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>Items:</h4>
                  {order.items?.map((item, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: index < order.items.length - 1 ? '1px solid #dee2e6' : 'none'
                    }}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#333' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>
                          Qty: {item.quantity}
                        </div>
                      </div>
                    <div style={{ fontWeight: '600', color: '#111111' }}>
                        ₹{item.price}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cost Breakdown */}
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                  <div style={{ 
                    background: '#e9ecef', 
                    padding: '12px', 
                    borderRadius: '6px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>Subtotal</div>
                    <div style={{ fontWeight: '600', color: '#333' }}>₹{order.subtotal}</div>
                  </div>
                  <div style={{ 
                    background: '#e9ecef', 
                    padding: '12px', 
                    borderRadius: '6px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>Shipping</div>
                    <div style={{ fontWeight: '600', color: '#333' }}>₹{order.shipping}</div>
                  </div>
                  <div style={{ 
                    background: '#111111', 
                    padding: '12px', 
                    borderRadius: '6px',
                    textAlign: 'center',
                    color: 'white'
                  }}>
                    <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total</div>
                    <div style={{ fontWeight: '600' }}>₹{order.total}</div>
                  </div>
                </div>

                {/* Shipping Address */}
                {order.shippingAddress && (
                  <div style={{ 
                    background: '#f8f9fa', 
                    padding: '16px', 
                    borderRadius: '6px',
                    borderLeft: '4px solid #007bff'
                  }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>Shipping Address:</h4>
                    <div style={{ fontSize: '0.9rem', color: '#495057', lineHeight: '1.4' }}>
                      {order.shippingAddress.address}<br />
                      {order.shippingAddress.apartment && `${order.shippingAddress.apartment}, `}
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                      {order.shippingAddress.phone}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
