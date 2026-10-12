import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';

export default function Clients() {
  const [orders, setOrders] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('lastActivity');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, contactsRes] = await Promise.all([
          api.get('/admin/orders'),
          api.get('/admin/contacts'),
        ]);
        setOrders(ordersRes.data || []);
        setContacts(contactsRes.data || []);
      } catch (e) {
        console.error('Failed to fetch client data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const clients = useMemo(() => {
    const map = new Map();

    orders.forEach((order) => {
      const email = order.customerEmail || (order.shippingAddress && order.shippingAddress.email);
      if (!email) return;

      const existing = map.get(email) || {
        email,
        name: order.customerName || '',
        phone: order.shippingAddress?.phone || '',
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: null,
        lastContactDate: null,
        lastMessage: '',
        addresses: new Set(),
      };

      existing.totalOrders += 1;
      if (typeof order.total === 'number') {
        existing.totalSpent += order.total;
      }

      const createdAt = order.createdAt ? new Date(order.createdAt) : null;
      if (createdAt && (!existing.lastOrderDate || createdAt > existing.lastOrderDate)) {
        existing.lastOrderDate = createdAt;
      }

      if (order.shippingAddress) {
        const addr = `${order.shippingAddress.address || ''} ${order.shippingAddress.city || ''} ${order.shippingAddress.state || ''}`.trim();
        if (addr) existing.addresses.add(addr);
      }

      map.set(email, existing);
    });

    contacts.forEach((message) => {
      const email = message.email;
      if (!email) return;

      const existing = map.get(email) || {
        email,
        name: `${message.firstName || ''} ${message.lastName || ''}`.trim(),
        phone: message.phone || '',
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: null,
        lastContactDate: null,
        lastMessage: '',
        addresses: new Set(),
      };

      const createdAt = message.createdAt ? new Date(message.createdAt) : null;
      if (createdAt && (!existing.lastContactDate || createdAt > existing.lastContactDate)) {
        existing.lastContactDate = createdAt;
        existing.lastMessage = message.message || '';
      }

      if (!existing.name) {
        existing.name = `${message.firstName || ''} ${message.lastName || ''}`.trim();
      }
      if (!existing.phone && message.phone) {
        existing.phone = message.phone;
      }
      if (message.address) {
        existing.addresses.add(message.address);
      }

      map.set(email, existing);
    });

    const list = Array.from(map.values()).map((c) => ({
      ...c,
      addresses: Array.from(c.addresses),
    }));

    const filtered = list.filter((c) => {
      const term = searchTerm.toLowerCase();
      if (!term) return true;
      return (
        c.email.toLowerCase().includes(term) ||
        (c.name && c.name.toLowerCase().includes(term)) ||
        (c.phone && c.phone.toLowerCase().includes(term)) ||
        (c.lastMessage && c.lastMessage.toLowerCase().includes(term))
      );
    });

    return [...filtered].sort((a, b) => {
      if (sortKey === 'value') return (b.totalSpent || 0) - (a.totalSpent || 0);
      if (sortKey === 'orders') return (b.totalOrders || 0) - (a.totalOrders || 0);

      const aDate = a.lastOrderDate || a.lastContactDate;
      const bDate = b.lastOrderDate || b.lastContactDate;
      if (!aDate && !bDate) return 0;
      if (!aDate) return 1;
      if (!bDate) return -1;
      return bDate - aDate;
    });
  }, [orders, contacts, searchTerm, sortKey]);

  const formatDate = (date) => {
    if (!date) return '—';
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div style={{ textAlign: 'center' }}>
          <div className="admin-spinner" />
          Loading clients…
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
          placeholder="Search by name, email, phone, or notes…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        <select
          className="admin-select"
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
        >
          <option value="lastActivity">Sort by last activity</option>
          <option value="value">Sort by total value</option>
          <option value="orders">Sort by total orders</option>
        </select>
      </div>

      {clients.length === 0 ? (
        <div className="admin-empty">
          <h3>No client activity yet</h3>
          <p>When users place orders or submit contact forms, they appear here automatically.</p>
        </div>
      ) : (
        <div className="admin-grid-cards">
          {clients.map((client) => (
            <article key={client.email} className="client-card">
              <div className="client-card-top">
                <div className="client-avatar">
                  {(client.name || client.email)[0]?.toUpperCase() || '?'}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#111' }}>
                    {client.name || 'Unknown name'}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>{client.email}</div>
                  {client.phone && (
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{client.phone}</div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--muted-soft)' }}>
                <span>Order: {formatDate(client.lastOrderDate)}</span>
                <span>·</span>
                <span>Contact: {formatDate(client.lastContactDate)}</span>
              </div>

              <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="metric-tile">
                  <div className="label">Orders</div>
                  <div className="value">{client.totalOrders}</div>
                </div>
                <div className="metric-tile">
                  <div className="label">Value</div>
                  <div className="value">₹{client.totalSpent || 0}</div>
                </div>
                <div className="metric-tile">
                  <div className="label">Addresses</div>
                  <div className="value">{client.addresses.length}</div>
                </div>
              </div>

              {client.addresses.length > 0 && (
                <div className="list-block" style={{ marginTop: 0, fontSize: 12 }}>
                  <strong>Addresses:</strong> {client.addresses.slice(0, 2).join(' · ')}
                  {client.addresses.length > 2 && ' …'}
                </div>
              )}

              {client.lastMessage && (
                <div className="list-block" style={{ marginTop: 0, borderLeft: '3px solid #111' }}>
                  <strong style={{ fontSize: 12 }}>Last message</strong>
                  <p
                    style={{
                      marginTop: 6,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      fontSize: 13,
                    }}
                  >
                    {client.lastMessage}
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
