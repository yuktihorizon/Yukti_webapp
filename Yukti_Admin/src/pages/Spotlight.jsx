import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function Spotlight() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', media: '' });
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchItems = async () => {
    try {
      const { data } = await api.get('/spotlight/getSpotlight');
      setItems(data);
    } catch (e) {
      console.error('Failed to fetch spotlight items:', e);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({ name: '', description: '', media: '' });
    setImageFile(null);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setForm({
      name: item.name,
      description: item.description,
      media: item.mediaUrl || ''
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      if (form.media) fd.append('media', form.media);
      if (imageFile) fd.append('image', imageFile);
      
      if (editingId) {
        // TODO: Add update endpoint
        await api.put(`/admin/spotlight/${editingId}`, fd);
      } else {
        await api.post('/admin/spotlight', fd);
      }
      
      await fetchItems();
      resetForm();
    } catch (e) {
      alert('Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete spotlight entry?')) return;
    try {
      await api.delete(`/admin/spotlight/${id}`);
      await fetchItems();
    } catch (e) {
      alert('Delete failed');
    }
  };

  return (
    <div>
      {/* Header actions */}
      <div style={{ 
        maxWidth: 1200, 
        margin: '0 auto 20px auto', 
        padding: '0 20px',
        display: 'flex',
        justifyContent: 'flex-end'
      }}>
        <button 
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '10px 20px',
            background: showForm ? '#e5e5e5' : '#111111',
            color: showForm ? '#111111' : '#ffffff',
            border: '1px solid #111111',
            borderRadius: '999px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          {showForm ? 'Cancel' : 'Add New'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ 
          maxWidth: 800, 
          margin: '20px auto', 
          padding: '20px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>
            {editingId ? 'Edit Spotlight Entry' : 'Add New Spotlight Entry'}
          </h3>
          <form onSubmit={handleCreate} style={{ display: 'grid', gap: '16px' }}>
            <input
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
              }}
              required
            />
            <input 
              name="media" 
              placeholder="Media URL (Instagram/YouTube link)" 
              value={form.media} 
              onChange={handleChange}
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
            <textarea 
              name="description" 
              placeholder="Description" 
              value={form.description} 
              onChange={handleChange}
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
                minHeight: '100px',
                resize: 'vertical'
              }}
            />
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Profile Image {!editingId && '*'}
              </label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                style={{
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
                required={!editingId}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                type="submit" 
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  background: loading ? '#d4d4d4' : '#111111',
                  color: '#ffffff',
                  border: '1px solid #111111',
                  borderRadius: '999px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: '600'
                }}
              >
                {loading ? 'Saving...' : (editingId ? 'Update' : 'Create')}
              </button>
              <button 
                type="button"
                onClick={resetForm}
                style={{
                  padding: '12px 24px',
                  background: '#ffffff',
                  color: '#111111',
                  border: '1px solid #111111',
                  borderRadius: '999px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Items Grid */}
      <div style={{ 
        maxWidth: 1200, 
        margin: '20px auto', 
        padding: '0 20px'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '20px' 
        }}>
          {items.map((item) => (
            <div key={item._id} style={{ 
              background: 'white', 
              borderRadius: '12px', 
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <div style={{ 
                aspectRatio: '1 / 1', 
                overflow: 'hidden', 
                background: '#f6f6f6'
              }}>
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }} 
                />
              </div>
              <div style={{ padding: '20px' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '1.2rem' }}>
                  {item.name}
                </h3>
                {item.description && (
                  <p style={{ 
                    margin: '0 0 16px 0', 
                    color: '#555', 
                    fontSize: '0.9rem',
                    lineHeight: '1.4'
                  }}>
                    {item.description}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {item.mediaUrl && (
                    <a 
                      href={item.mediaUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      style={{
                        padding: '6px 12px',
                        background: '#111111',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '999px',
                        fontSize: '0.8rem'
                      }}
                    >
                      View Media
                    </a>
                  )}
                  <button 
                    onClick={() => handleEdit(item)}
                    style={{
                      padding: '6px 12px',
                      background: '#ffffff',
                      color: '#111111',
                      border: '1px solid #111111',
                      borderRadius: '999px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(item._id)}
                    style={{
                      padding: '6px 12px',
                      background: '#ffffff',
                      color: '#111111',
                      border: '1px solid #111111',
                      borderRadius: '999px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {items.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            color: '#666'
          }}>
            <h3>No spotlight entries yet</h3>
            <p>Click "Add New" to create your first spotlight entry.</p>
          </div>
        )}
      </div>
    </div>
  );
}
