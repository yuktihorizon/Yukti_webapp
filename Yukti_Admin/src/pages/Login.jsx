import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { setToken } from '../lib/auth';
import headerLogo from '../assets/yuktiHorizonHeaderLogo.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      const { data } = await api.post('/admin/login', { email, password });
      setToken(data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <section className="login-brand">
        <img src={headerLogo} alt="Yukti Horizon" className="login-brand-logo" />
        <div className="login-brand-copy">
          <h1>Control center for the Yukti storefront</h1>
          <p>
            Manage catalogue, orders, spotlight, services, and Get in Touch inquiries — the same brand language as the live site.
          </p>
        </div>
        <div className="login-brand-footer">Yukti Horizon · Admin</div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <h2>Sign in</h2>
          <p>Use your admin credentials to continue.</p>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={onSubmit} className="login-form">
            <div>
              <label className="login-label" htmlFor="admin-email">
                Email address
              </label>
              <input
                id="admin-email"
                className="admin-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@yukti.com"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label className="login-label" htmlFor="admin-password">
                Password
              </label>
              <input
                id="admin-password"
                className="admin-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="login-footnote">Secure access · Yukti Horizon</div>
        </div>
      </section>
    </div>
  );
}
