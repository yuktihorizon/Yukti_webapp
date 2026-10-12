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

  useEffect(() => {
    fetchItems();
  }, []);

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
      media: item.mediaUrl || '',
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
        await api.put(`/admin/spotlight/${editingId}`, fd);
      } else {
        await api.post('/admin/spotlight', fd);
      }

      await fetchItems();
      resetForm();
    } catch (err) {
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
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="admin-page">
      <div className="page-actions">
        <button
          type="button"
          className={`admin-btn ${showForm ? 'admin-btn-secondary' : 'admin-btn-primary'}`}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add new'}
        </button>
      </div>

      {showForm && (
        <div className="form-panel">
          <h3 style={{ margin: '0 0 18px', fontSize: 18 }}>
            {editingId ? 'Edit spotlight entry' : 'Add spotlight entry'}
          </h3>
          <form onSubmit={handleCreate} className="form-grid">
            <div>
              <label className="form-label">Name</label>
              <input
                className="admin-input"
                name="name"
                placeholder="Creator name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="form-label">Media URL</label>
              <input
                className="admin-input"
                name="media"
                placeholder="Instagram / YouTube link"
                value={form.media}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="form-label">Description</label>
              <textarea
                className="admin-textarea"
                name="description"
                placeholder="Short bio or caption"
                value={form.description}
                onChange={handleChange}
                rows={4}
              />
            </div>
            <div>
              <label className="form-label">Profile image {!editingId && '*'}</label>
              <input
                className="admin-input"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                required={!editingId}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="submit" className="admin-btn admin-btn-primary" disabled={loading}>
                {loading ? 'Saving…' : editingId ? 'Update' : 'Create'}
              </button>
              <button type="button" className="admin-btn admin-btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {items.length === 0 ? (
        <div className="admin-empty">
          <h3>No spotlight entries yet</h3>
          <p>Click “Add new” to feature your first creator.</p>
        </div>
      ) : (
        <div className="spotlight-grid">
          {items.map((item) => (
            <article key={item._id} className="spotlight-card">
              <img src={item.imageUrl} alt={item.name} />
              <div className="spotlight-card-body">
                <h3>{item.name}</h3>
                {item.description && <p>{item.description}</p>}
                <div className="spotlight-actions">
                  {item.mediaUrl && (
                    <a
                      href={item.mediaUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="admin-btn admin-btn-primary"
                      style={{ padding: '7px 12px', fontSize: 12 }}
                    >
                      View media
                    </a>
                  )}
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    style={{ padding: '7px 12px', fontSize: 12 }}
                    onClick={() => handleEdit(item)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn-danger"
                    style={{ padding: '7px 12px', fontSize: 12 }}
                    onClick={() => handleDelete(item._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
