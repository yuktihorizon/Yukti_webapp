import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Spotlight from './pages/Spotlight.jsx';
import Products from './pages/Products.jsx';
import Contacts from './pages/Contacts.jsx';
import Orders from './pages/Orders.jsx';
import Clients from './pages/Clients.jsx';
import ServicePage from './pages/ServicePage.jsx';
import BlogAdmin from './pages/BlogAdmin.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import { getToken } from './lib/auth.js';

function PrivateRoute({ children }) {
  const token = getToken();
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="spotlight" element={<Spotlight />} />
        <Route path="products" element={<Products />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="service-page" element={<ServicePage />} />
        <Route path="blog" element={<BlogAdmin />} />
        <Route path="orders" element={<Orders />} />
        <Route path="clients" element={<Clients />} />
      </Route>
    </Routes>
  );
}

