import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { clearToken } from '../lib/auth';
import headerLogo from '../assets/yuktiHorizonHeaderLogo.png';
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  Star,
  MessageSquare,
  Briefcase,
  FileText,
  BookOpen,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, exact: true },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/spotlight', label: 'Spotlight', icon: Star },
  { to: '/service-page', label: 'Service page', icon: Briefcase },
  { to: '/blog', label: 'Our Concepts', icon: FileText },
  { to: '/catalogues', label: 'Catalogues', icon: BookOpen },
  { to: '/contacts', label: 'Messages', icon: MessageSquare },
];

const pageCopy = {
  '/': 'Monitor customers, orders and catalog in a single place.',
  '/clients': 'People who ordered or reached out — your living CRM.',
  '/orders': 'Track purchases, fulfilment status, and shipping details.',
  '/products': 'Manage catalogue items, media, and category placement.',
  '/spotlight': 'Feature creators and collaborators on the storefront.',
  '/service-page': 'Edit the public services page without a redeploy.',
  '/blog': 'Publish concepts — articles, image sets, and presentations.',
  '/catalogues': 'Upload PDFs to Cloudinary. They open on the storefront catalogues page.',
  '/contacts': 'Read and search messages from Get in Touch.',
};

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    clearToken();
    navigate('/login');
  };

  const activeLabel =
    location.pathname === '/'
      ? 'Overview'
      : navItems.find((n) => n.to === location.pathname)?.label || 'Admin';

  const subtitle = pageCopy[location.pathname] || 'Yukti Horizon control center';

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <div className="admin-shell">
      <div
        className={`admin-overlay${sidebarOpen ? ' open' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden={!sidebarOpen}
      />

      <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="admin-sidebar-header">
          <img src={headerLogo} alt="Yukti Horizon" className="admin-logo-img" />
        </div>
        <div className="admin-logo-text" style={{ padding: '0 12px', marginTop: -12 }}>
          <div className="admin-logo-subtitle">Admin · Control Center</div>
        </div>

        <div>
          <div className="admin-nav-section-label">Workspace</div>
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
                    <item.icon size={16} strokeWidth={1.7} />
                  </span>
                )}
                <span className="admin-nav-label">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-meta">Signed in as admin</div>
          <button type="button" className="admin-logout" onClick={handleLogout}>
            <LogOut size={16} strokeWidth={1.7} />
            <span className="admin-nav-label">Logout</span>
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-menu-btn"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div>
              <h1 className="admin-topbar-title">{activeLabel}</h1>
              <p className="admin-topbar-subtitle">{subtitle}</p>
            </div>
          </div>
          <div className="admin-topbar-right">
            <div className="admin-pill">
              <span className="admin-pill-dot" />
              Live
            </div>
            <div className="admin-pill">{today}</div>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
