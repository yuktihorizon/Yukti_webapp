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

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'delivered') return 'admin-badge admin-badge-success';
    if (s === 'cancelled') return 'admin-badge admin-badge-warn';
    if (s === 'shipped' || s === 'processing') return 'admin-badge admin-badge-info';
    return 'admin-badge admin-badge-neutral';
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div style={{ textAlign: 'center' }}>
          <div className="admin-spinner" />
          Loading orders…
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-toolbar">
        <input
          className="admin-input"
          type="text"
          placeholder="Search by customer, email, or order ID…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        <select
          className="admin-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="admin-empty">
          <h3>{searchTerm || statusFilter !== 'all' ? 'No orders found' : 'No orders yet'}</h3>
          <p>
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filter.'
              : 'Orders will appear here once customers check out.'}
          </p>
        </div>
      ) : (
        <div className="admin-stack">
          {filteredOrders.map((order) => (
            <article key={order._id} className="list-card">
              <div className="list-card-head">
                <div>
                  <h3>Order #{order.orderId || order._id?.slice(-6)}</h3>
                  <div className="list-card-meta">
                    <span>{order.customerName || 'Customer'}</span>
                    <span>{order.customerEmail}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', display: 'grid', gap: 8, justifyItems: 'end' }}>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>{formatDate(order.createdAt)}</span>
                  <span className={statusBadge(order.status)}>{order.status || 'Pending'}</span>
                </div>
              </div>

              {order.items?.length > 0 && (
                <div className="list-block">
                  <strong style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Items
                  </strong>
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 12,
                        padding: '10px 0',
                        borderBottom:
                          index < order.items.length - 1 ? '1px solid var(--line)' : 'none',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>{item.name || item.productId || 'Item'}</div>
                        <div style={{ fontSize: 13, color: 'var(--muted)' }}>Qty: {item.quantity}</div>
                      </div>
                      {item.price != null && (
                        <div style={{ fontWeight: 700 }}>₹{item.price}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="metric-grid">
                <div className="metric-tile">
                  <div className="label">Subtotal</div>
                  <div className="value">₹{order.subtotal ?? order.totalAmount ?? '—'}</div>
                </div>
                <div className="metric-tile">
                  <div className="label">Shipping</div>
                  <div className="value">₹{order.shipping ?? '—'}</div>
                </div>
                <div className="metric-tile dark">
                  <div className="label">Total</div>
                  <div className="value">₹{order.total ?? order.totalAmount ?? '—'}</div>
                </div>
              </div>

              {order.shippingAddress && (
                <div className="list-block" style={{ borderLeft: '3px solid #111' }}>
                  <strong style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Shipping
                  </strong>
                  <p style={{ marginTop: 8 }}>
                    {order.shippingAddress.address}
                    {order.shippingAddress.apartment ? `, ${order.shippingAddress.apartment}` : ''}
                    <br />
                    {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                    {order.shippingAddress.zipCode}
                    {order.shippingAddress.phone ? (
                      <>
                        <br />
                        {order.shippingAddress.phone}
                      </>
                    ) : null}
                  </p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
