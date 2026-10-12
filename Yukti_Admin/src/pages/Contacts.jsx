import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function Contacts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const { data } = await api.get('/admin/contacts');
        setItems(data);
      } catch (e) {
        console.error('Failed to fetch contacts:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  const filteredItems = items.filter(
    (item) =>
      item.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (loading) {
    return (
      <div className="admin-loading">
        <div style={{ textAlign: 'center' }}>
          <div className="admin-spinner" />
          Loading messages…
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
          placeholder="Search by name, email, subject, or message…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredItems.length === 0 ? (
        <div className="admin-empty">
          <h3>{searchTerm ? 'No messages found' : 'No contact messages yet'}</h3>
          <p>
            {searchTerm
              ? 'Try adjusting your search terms.'
              : 'Messages from the contact form will appear here.'}
          </p>
        </div>
      ) : (
        <div className="admin-stack">
          {filteredItems.map((message) => (
            <article key={message._id} className="list-card">
              <div className="list-card-head">
                <div>
                  <h3>
                    {message.firstName} {message.lastName}
                  </h3>
                  <div className="list-card-meta">
                    <a href={`mailto:${message.email}`}>{message.email}</a>
                    {message.phone && <span>{message.phone}</span>}
                  </div>
                </div>
                <span style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                  {formatDate(message.createdAt)}
                </span>
              </div>

              {message.subject && (
                <div className="list-block">
                  <strong>Subject:</strong> {message.subject}
                </div>
              )}

              <div className="list-block" style={{ borderLeft: '3px solid #111' }}>
                <p>{message.message}</p>
              </div>

              {message.address && (
                <div className="list-block">
                  <strong>Address:</strong> {message.address}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
