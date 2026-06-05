import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, spotlight: 0, contacts: 0, orders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, spotlightRes, contactsRes, ordersRes] = await Promise.all([
          api.get('/products/getproducts'),
          api.get('/spotlight/getSpotlight'),
          api.get('/admin/contacts'),
          api.get('/admin/orders')
        ]);
        setStats({
          products: productsRes.data.length,
          spotlight: spotlightRes.data.length,
          contacts: contactsRes.data.length,
          orders: ordersRes.data.length
        });
      } catch (e) {
        console.error('Failed to fetch stats:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="admin-loading">
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #d4d4d4',
            borderTop: '3px solid #111111',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px auto'
          }}></div>
          <p style={{ color: '#4b5563', fontSize: '16px', margin: 0 }}>Loading dashboard...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Stats Cards */}
      <div className="admin-dashboard-grid">
        <div style={{ 
          background: '#ffffff', 
          padding: '28px', 
          borderRadius: '18px', 
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
          textAlign: 'center',
          border: '1px solid #e5e5e5',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 14px 40px rgba(0,0,0,0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)';
        }}
        >
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '999px',
            border: '1px solid #111111',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto',
            fontSize: '12px',
            color: '#111111',
            textTransform: 'uppercase',
            letterSpacing: '0.08em'
          }}>
            PROD
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#111111', marginBottom: '8px' }}>
            {stats.products}
          </div>
          <div style={{ color: '#4b5563', fontSize: '14px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Products</div>
        </div>
        
        <div style={{ 
          background: '#ffffff', 
          padding: '28px', 
          borderRadius: '18px', 
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
          textAlign: 'center',
          border: '1px solid #e5e5e5',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 14px 40px rgba(0,0,0,0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)';
        }}
        >
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '999px',
            border: '1px solid #111111',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto',
            fontSize: '12px',
            color: '#111111',
            textTransform: 'uppercase',
            letterSpacing: '0.08em'
          }}>
            SPOT
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#48bb78', marginBottom: '8px' }}>
            {stats.spotlight}
          </div>
          <div style={{ color: '#4a5568', fontSize: '16px', fontWeight: '600' }}>Spotlight Entries</div>
        </div>
        
        <div style={{ 
          background: '#ffffff', 
          padding: '28px', 
          borderRadius: '18px', 
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
          textAlign: 'center',
          border: '1px solid #e5e5e5',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 14px 40px rgba(0,0,0,0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)';
        }}
        >
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '999px',
            border: '1px solid #111111',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto',
            fontSize: '12px',
            color: '#111111',
            textTransform: 'uppercase',
            letterSpacing: '0.08em'
          }}>
            MSG
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#ed8936', marginBottom: '8px' }}>
            {stats.contacts}
          </div>
          <div style={{ color: '#4a5568', fontSize: '16px', fontWeight: '600' }}>Contact Messages</div>
        </div>

        <div style={{ 
          background: '#ffffff', 
          padding: '28px', 
          borderRadius: '18px', 
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
          textAlign: 'center',
          border: '1px solid #e5e5e5',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 14px 40px rgba(0,0,0,0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)';
        }}
        >
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '999px',
            border: '1px solid #111111',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto',
            fontSize: '12px',
            color: '#111111',
            textTransform: 'uppercase',
            letterSpacing: '0.08em'
          }}>
            ORD
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#4299e1', marginBottom: '8px' }}>
            {stats.orders}
          </div>
          <div style={{ color: '#4a5568', fontSize: '16px', fontWeight: '600' }}>Total Orders</div>
        </div>
      </div>

      {/* Brand at bottom of dashboard */}
      <div
        style={{
          marginTop: '64px',
          textAlign: 'center',
          fontSize: '28px',
          fontWeight: 300,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#737373',
          fontFamily:
            '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        Yukti 
      </div>

      {/* Navigation Cards (temporarily disabled)
      <div className="admin-dashboard-grid nav">
        ...
      </div>
      */}
    </div>
  );
}
