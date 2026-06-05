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

  const filteredItems = items.filter(item => 
    item.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="admin-loading">Loading messages...</div>
    );
  }

  return (
    <div>
      {/* Search */}
      <div style={{ 
        maxWidth: 1200, 
        margin: '20px auto', 
        padding: '0 20px'
      }}>
        <div style={{ 
          background: 'white', 
          padding: '16px', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <input 
            type="text"
            placeholder="Search messages by name, email, subject, or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '16px'
            }}
          />
        </div>
      </div>

      {/* Messages */}
      <div style={{ 
        maxWidth: 1200, 
        margin: '0 auto', 
        padding: '0 20px 20px 20px'
      }}>
        {filteredItems.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            color: '#666'
          }}>
            <h3>
              {searchTerm ? 'No messages found' : 'No contact messages yet'}
            </h3>
            <p>
              {searchTerm 
                ? 'Try adjusting your search terms.' 
                : 'Messages from the contact form will appear here.'
              }
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {filteredItems.map((message) => (
              <div key={message._id} style={{ 
                background: 'white', 
                borderRadius: '12px', 
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '16px'
                }}>
                  <div>
                    <h3 style={{ 
                      margin: '0 0 8px 0', 
                      color: '#333', 
                      fontSize: '1.2rem',
                      fontWeight: '600'
                    }}>
                      {message.firstName} {message.lastName}
                    </h3>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '16px',
                      flexWrap: 'wrap'
                    }}>
                      <a 
                        href={`mailto:${message.email}`}
                        style={{
                          color: '#111111',
                          textDecoration: 'none',
                          fontSize: '0.9rem'
                        }}
                      >
                        {message.email}
                      </a>
                      {message.phone && (
                        <span style={{ color: '#666', fontSize: '0.9rem' }}>
                          {message.phone}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ 
                    textAlign: 'right',
                    fontSize: '0.8rem',
                    color: '#666'
                  }}>
                    {formatDate(message.createdAt)}
                  </div>
                </div>

                {message.subject && (
                  <div style={{ 
                    background: '#f8f9fa', 
                    padding: '12px', 
                    borderRadius: '6px',
                    marginBottom: '16px'
                  }}>
                    <strong style={{ color: '#495057' }}>Subject:</strong>
                    <span style={{ marginLeft: '8px', color: '#333' }}>
                      {message.subject}
                    </span>
                  </div>
                )}

                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '16px', 
                  borderRadius: '6px',
                  borderLeft: '4px solid #007bff'
                }}>
                  <p style={{ 
                    margin: 0, 
                    color: '#333', 
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {message.message}
                  </p>
                </div>

                {message.address && (
                  <div style={{ 
                    marginTop: '16px', 
                    padding: '12px', 
                    background: '#e9ecef',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    color: '#495057'
                  }}>
                    <strong>Address:</strong> {message.address}
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
