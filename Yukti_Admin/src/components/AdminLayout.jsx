import React from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { clearToken } from '../lib/auth';
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  Star,
  MessageSquare,
  Briefcase,
  FileText,
  LogOut,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, exact: true },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/spotlight', label: 'Spotlight', icon: Star },
  { to: '/service-page', label: 'Service page', icon: Briefcase },
  { to: '/blog', label: 'Our Concepts', icon: FileText },
  { to: '/contacts', label: 'Messages', icon: MessageSquare },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    clearToken();
    navigate('/login');
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-logo-mark">Y</div>
          <div className="admin-logo-text">
            <div className="admin-logo-title">Yukti Admin</div>
            <div className="admin-logo-subtitle">Control Center</div>
          </div>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `admin-nav-item${isActive ? ' admin-nav-item-active' : ''}`
              }
            >
              {item.icon && (
                <span className="admin-nav-icon">
                  <item.icon size={16} strokeWidth={1.6} />
                </span>
              )}
              <span className="admin-nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button className="admin-logout" onClick={handleLogout}>
          <span className="admin-nav-label">Logout</span>
        </button>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <h1 className="admin-topbar-title">
              {location.pathname === '/'
                ? 'Overview'
                : navItems.find((n) => n.to === location.pathname)?.label || 'Admin'}
            </h1>
            <p className="admin-topbar-subtitle">
              Monitor customers, orders and catalog in a single place.
            </p>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

