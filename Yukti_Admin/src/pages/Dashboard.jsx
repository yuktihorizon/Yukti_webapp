import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Star,
  MessageSquare,
  ShoppingCart,
  ArrowUpRight,
  Plus,
  Users,
  FileText,
  Briefcase,
  Image as ImageIcon,
} from 'lucide-react';
import { api } from '../lib/api';

const formatRelative = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const initials = (first = '', last = '') => {
  const a = (first || '').trim().charAt(0);
  const b = (last || '').trim().charAt(0);
  return (a + b || '?').toUpperCase();
};

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [spotlight, setSpotlight] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const [productsRes, spotlightRes, contactsRes, ordersRes] = await Promise.all([
          api.get('/products/getproducts'),
          api.get('/spotlight/getSpotlight'),
          api.get('/admin/contacts'),
          api.get('/admin/orders'),
        ]);
        setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
        setSpotlight(Array.isArray(spotlightRes.data) ? spotlightRes.data : []);
        setContacts(Array.isArray(contactsRes.data) ? contactsRes.data : []);
        setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
      } catch (e) {
        console.error('Failed to fetch stats:', e);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [retryCount]);

  const categoryBreakdown = useMemo(() => {
    const map = new Map();
    products.forEach((p) => {
      const name = p.category?.name || p.category?.mainCategory || 'Uncategorized';
      map.set(name, (map.get(name) || 0) + 1);
    });
    const rows = Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    const max = rows[0]?.count || 1;
    return rows.map((r) => ({ ...r, pct: Math.round((r.count / max) * 100) }));
  }, [products]);

  const recentMessages = useMemo(() => {
    return [...contacts]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5);
  }, [contacts]);

  const recentProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 4);
  }, [products]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) {
    return (
      <div className="admin-loading">
        <div style={{ textAlign: 'center' }}>
          <div className="admin-spinner" />
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: 14 }}>Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="admin-loading">
        <div className="admin-empty" style={{ maxWidth: 420 }}>
          <h3>Unable to load dashboard</h3>
          <p style={{ marginBottom: 16 }}>The API may still be starting. Try again in a moment.</p>
          <button type="button" className="admin-btn admin-btn-primary" onClick={() => setRetryCount((n) => n + 1)}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      to: '/products',
      value: products.length,
      label: 'Total products',
      hint: 'Live in catalogue',
      icon: Package,
      tone: 'products',
    },
    {
      to: '/spotlight',
      value: spotlight.length,
      label: 'Spotlight entries',
      hint: 'Creators featured',
      icon: Star,
      tone: 'spotlight',
    },
    {
      to: '/contacts',
      value: contacts.length,
      label: 'Contact messages',
      hint: 'Inbox inquiries',
      icon: MessageSquare,
      tone: 'messages',
    },
    {
      to: '/orders',
      value: orders.length,
      label: 'Total orders',
      hint: 'Checkout completed',
      icon: ShoppingCart,
      tone: 'orders',
    },
  ];

  return (
    <div className="dash">
      <section className="dash-hero">
        <p className="dash-hero-eyebrow">{greeting} · Yukti Horizon</p>
        <h2>Storefront, services & concepts — one control center.</h2>
        <p>
          Same black-and-white brand as the live site. Jump into catalogue, orders, spotlight, and Get in Touch from here.
        </p>
        <div className="dash-hero-meta">
          <span className="dash-hero-chip">
            <Package size={13} /> {products.length} products
          </span>
          <span className="dash-hero-chip">
            <MessageSquare size={13} /> {contacts.length} messages
          </span>
          <span className="dash-hero-chip">
            <ShoppingCart size={13} /> {orders.length} orders
          </span>
        </div>
      </section>

      <section className="dash-stats">
        {stats.map((stat) => (
          <Link key={stat.to} to={stat.to} className="dash-stat">
            <div className="dash-stat-top">
              <div className={`dash-stat-icon ${stat.tone}`}>
                <stat.icon size={18} strokeWidth={1.8} />
              </div>
              <ArrowUpRight size={16} className="dash-stat-arrow" />
            </div>
            <div className="dash-stat-value">{stat.value}</div>
            <div className="dash-stat-label">{stat.label}</div>
            <div className="dash-stat-hint">{stat.hint}</div>
          </Link>
        ))}
      </section>

      <section className="dash-panels">
        <div className="dash-panel">
          <div className="dash-panel-head">
            <div>
              <h3>Recent messages</h3>
              <span>Latest Get in Touch inquiries</span>
            </div>
            <Link to="/contacts" className="dash-link">
              View all
            </Link>
          </div>
          <div className="dash-panel-body">
            {recentMessages.length === 0 ? (
              <div className="admin-empty" style={{ border: 'none', boxShadow: 'none', padding: 32 }}>
                <h3 style={{ fontSize: 16 }}>No messages yet</h3>
                <p>Contact form submissions will show up here.</p>
              </div>
            ) : (
              <div className="dash-activity">
                {recentMessages.map((msg) => (
                  <Link key={msg._id} to="/contacts" className="dash-activity-row">
                    <div className="dash-avatar">{initials(msg.firstName, msg.lastName)}</div>
                    <div style={{ minWidth: 0 }}>
                      <p className="dash-activity-title">
                        {msg.firstName} {msg.lastName}
                      </p>
                      <p className="dash-activity-meta">{msg.subject || msg.email}</p>
                    </div>
                    <span className="dash-activity-time">{formatRelative(msg.createdAt)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="dash-panel">
          <div className="dash-panel-head">
            <div>
              <h3>Quick actions</h3>
              <span>Jump into common tasks</span>
            </div>
          </div>
          <div className="dash-actions">
            <Link to="/products" className="dash-action">
              <span className="dash-action-icon">
                <Plus size={16} />
              </span>
              <strong>Add product</strong>
              <span>Catalogue & media</span>
            </Link>
            <Link to="/spotlight" className="dash-action">
              <span className="dash-action-icon">
                <Star size={16} />
              </span>
              <strong>New spotlight</strong>
              <span>Feature a creator</span>
            </Link>
            <Link to="/blog" className="dash-action">
              <span className="dash-action-icon">
                <FileText size={16} />
              </span>
              <strong>Publish concept</strong>
              <span>Articles & decks</span>
            </Link>
            <Link to="/clients" className="dash-action">
              <span className="dash-action-icon">
                <Users size={16} />
              </span>
              <strong>View clients</strong>
              <span>Orders + inquiries</span>
            </Link>
            <Link to="/service-page" className="dash-action">
              <span className="dash-action-icon">
                <Briefcase size={16} />
              </span>
              <strong>Edit services</strong>
              <span>CMS page content</span>
            </Link>
            <Link to="/orders" className="dash-action">
              <span className="dash-action-icon">
                <ShoppingCart size={16} />
              </span>
              <strong>Check orders</strong>
              <span>Fulfilment status</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="dash-panels">
        <div className="dash-panel">
          <div className="dash-panel-head">
            <div>
              <h3>Latest products</h3>
              <span>Recently added to catalogue</span>
            </div>
            <Link to="/products" className="dash-link">
              Manage
            </Link>
          </div>
          <div className="dash-panel-body">
            {recentProducts.length === 0 ? (
              <div className="admin-empty" style={{ border: 'none', boxShadow: 'none', padding: 32 }}>
                <h3 style={{ fontSize: 16 }}>No products yet</h3>
                <p>Add your first catalogue item to get started.</p>
              </div>
            ) : (
              recentProducts.map((product) => {
                const thumb = product.thumbnails?.[0] || product.images?.[0];
                return (
                  <div key={product._id} className="dash-product-row">
                    {thumb ? (
                      <img src={thumb} alt="" className="dash-product-thumb" />
                    ) : (
                      <div className="dash-product-thumb placeholder">
                        <ImageIcon size={18} />
                      </div>
                    )}
                    <div style={{ minWidth: 0 }}>
                      <p className="dash-product-name">{product.name}</p>
                      <p className="dash-product-meta">
                        {product.category?.name || 'Uncategorized'}
                        {product.series ? ` · ${product.series}` : ''}
                      </p>
                    </div>
                    <div className="dash-product-price">
                      {typeof product.price === 'number' ? `₹${product.price.toLocaleString('en-IN')}` : '—'}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="dash-panel">
          <div className="dash-panel-head">
            <div>
              <h3>Catalogue mix</h3>
              <span>Products by category</span>
            </div>
          </div>
          <div className="dash-breakdown">
            {categoryBreakdown.length === 0 ? (
              <div className="admin-empty" style={{ border: 'none', boxShadow: 'none', padding: 24 }}>
                <p>Category data will appear once products are added.</p>
              </div>
            ) : (
              categoryBreakdown.map((row) => (
                <div key={row.name} className="dash-bar-row">
                  <div className="dash-bar-label" title={row.name}>
                    {row.name}
                  </div>
                  <div className="dash-bar-track">
                    <div className="dash-bar-fill" style={{ width: `${row.pct}%` }} />
                  </div>
                  <div className="dash-bar-count">{row.count}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
