import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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

    // Aggregate from orders
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

    // Aggregate from contacts
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

    // Search filter
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

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      if (sortKey === 'value') {
        return (b.totalSpent || 0) - (a.totalSpent || 0);
      }
      if (sortKey === 'orders') {
        return (b.totalOrders || 0) - (a.totalOrders || 0);
      }

      const aDate = a.lastOrderDate || a.lastContactDate;
      const bDate = b.lastOrderDate || b.lastContactDate;
      if (!aDate && !bDate) return 0;
      if (!aDate) return 1;
      if (!bDate) return -1;
      return bDate - aDate;
    });

    return sorted;
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
    return <div className="admin-loading">Loading client CRM...</div>;
  }

  return (
    <div>
      {/* Controls */}
      <div
        style={{
          maxWidth: 1200,
          margin: '20px auto',
          padding: '0 20px',
        }}
      >
        <div
          style={{
            background: 'white',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '16px',
            alignItems: 'center',
          }}
        >
          <input
            type="text"
            placeholder="Search by name, email, phone, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '16px',
            }}
          />

          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            style={{
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '16px',
              minWidth: '180px',
            }}
          >
            <option value="lastActivity">Sort by last activity</option>
            <option value="value">Sort by total value</option>
            <option value="orders">Sort by total orders</option>
          </select>
        </div>
      </div>

      {/* Clients grid */}
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 20px 20px 20px',
        }}
      >
        {clients.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#666',
            }}
          >
            <h3>No client activity yet</h3>
            <p>When users place orders or submit contact forms, they will appear here automatically.</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px',
            }}
          >
            {clients.map((client) => (
              <div
                key={client.email}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: '1px solid #e9ecef',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {/* Header: basic identity */}
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '999px',
                        border: '1px solid #111111',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        color: '#111111',
                      }}
                    >
                      {(client.name || client.email)[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          color: '#1a202c',
                          marginBottom: 4,
                        }}
                      >
                        {client.name || 'Unknown name'}
                      </div>
                      <div style={{ fontSize: 13, color: '#4a5568' }}>{client.email}</div>
                      {client.phone && (
                        <div style={{ fontSize: 13, color: '#4a5568', marginTop: 2 }}>{client.phone}</div>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 12, color: '#718096' }}>
                    <div>Last order: {formatDate(client.lastOrderDate)}</div>
                    <div>Last contact: {formatDate(client.lastContactDate)}</div>
                  </div>
                </div>

                {/* Metrics */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
                    gap: 8,
                    marginTop: 4,
                  }}
                >
                  <div
                    style={{
                      background: '#f8f9fa',
                      padding: '8px 10px',
                      borderRadius: 8,
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 11, color: '#718096', marginBottom: 2 }}>Orders</div>
                    <div style={{ fontWeight: 600, color: '#1a202c' }}>{client.totalOrders}</div>
                  </div>
                  <div
                    style={{
                      background: '#f8f9fa',
                      padding: '8px 10px',
                      borderRadius: 8,
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 11, color: '#718096', marginBottom: 2 }}>Total Value</div>
                    <div style={{ fontWeight: 600, color: '#38a169' }}>₹{client.totalSpent || 0}</div>
                  </div>
                  <div
                    style={{
                      background: '#f8f9fa',
                      padding: '8px 10px',
                      borderRadius: 8,
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 11, color: '#718096', marginBottom: 2 }}>Addresses</div>
                    <div style={{ fontWeight: 600, color: '#1a202c' }}>{client.addresses.length}</div>
                  </div>
                </div>

                {/* Addresses (short) */}
                {client.addresses.length > 0 && (
                  <div
                    style={{
                      background: '#f8f9fa',
                      padding: '8px 10px',
                      borderRadius: 8,
                      fontSize: 12,
                      color: '#4a5568',
                    }}
                  >
                    <strong style={{ fontSize: 12 }}>Addresses:</strong>{' '}
                    {client.addresses.slice(0, 2).join(' · ')}
                    {client.addresses.length > 2 && ' …'}
                  </div>
                )}

                {/* Last message */}
                {client.lastMessage && (
                  <div
                    style={{
                      background: '#f5f5f5',
                      padding: '10px 12px',
                      borderRadius: 8,
                      borderLeft: '3px solid #111111',
                      fontSize: 12,
                      color: '#111111',
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>Last message</div>
                    <div
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {client.lastMessage}
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

