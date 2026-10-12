import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

const emptyForm = {
  title: '',
  description: '',
  published: true,
};

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Catalogues() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [pdfFile, setPdfFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const fetchItems = async () => {
    try {
      const { data } = await api.get('/admin/catalogues');
      setItems(data);
    } catch (e) {
      console.error('Failed to fetch catalogues:', e);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setPdfFile(null);
    setCoverFile(null);
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const handleEdit = (item) => {
    setForm({
      title: item.title || '',
      description: item.description || '',
      published: item.published !== false,
    });
    setPdfFile(null);
    setCoverFile(null);
    setEditingId(item._id);
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!editingId && !pdfFile) {
      setError('Please choose a PDF to upload.');
      return;
    }

    try {
      setLoading(true);
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('published', form.published ? 'true' : 'false');
      if (pdfFile) fd.append('pdf', pdfFile);
      if (coverFile) fd.append('cover', coverFile);

      if (editingId) {
        await api.put(`/admin/catalogues/${editingId}`, fd, { timeout: 240000 });
      } else {
        await api.post('/admin/catalogues', fd, { timeout: 240000 });
      }

      await fetchItems();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please try again (max 30 MB).');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this catalogue PDF?')) return;
    try {
      await api.delete(`/admin/catalogues/${id}`);
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
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
        >
          {showForm ? 'Cancel' : 'Upload PDF'}
        </button>
      </div>

      {showForm && (
        <div className="form-panel">
          <h3 style={{ margin: '0 0 18px', fontSize: 18 }}>
            {editingId ? 'Edit catalogue' : 'Upload catalogue PDF'}
          </h3>
          <form onSubmit={handleSubmit} className="form-grid">
            <div>
              <label className="form-label">Title</label>
              <input
                className="admin-input"
                name="title"
                placeholder="Yukti Horizon Catalogue"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="form-label">Short description</label>
              <textarea
                className="admin-textarea"
                name="description"
                placeholder="Optional note shown on the catalogues page"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <label className="form-label">PDF file {!editingId && '*'}</label>
              <input
                className="admin-input"
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                required={!editingId}
              />
              <p style={{ margin: '6px 0 0', fontSize: 12, color: '#777' }}>
                {editingId
                  ? 'Leave empty to keep the current PDF. The original file is stored as-is. Max 30 MB.'
                  : 'The original PDF is stored as-is and opened on the storefront. Max 30 MB.'}
              </p>
            </div>
            <div>
              <label className="form-label">Cover image (optional)</label>
              <input
                className="admin-input"
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
              />
            </div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
              />
              Visible on the storefront
            </label>
            {error && (
              <p style={{ margin: 0, color: '#b42318', fontSize: 13 }}>{error}</p>
            )}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="submit" className="admin-btn admin-btn-primary" disabled={loading}>
                {loading ? 'Saving…' : editingId ? 'Update' : 'Upload'}
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
          <h3>No catalogues yet</h3>
          <p>Upload a PDF. It appears on the storefront under Our Catalogues.</p>
        </div>
      ) : (
        <div className="spotlight-grid">
          {items.map((item) => (
            <article key={item._id} className="spotlight-card">
              {item.coverUrl ? (
                <img src={item.coverUrl} alt={item.title} />
              ) : (
                <div
                  style={{
                    height: 200,
                    display: 'grid',
                    placeItems: 'center',
                    background: '#111',
                    color: '#fff',
                    fontSize: 13,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                  }}
                >
                  PDF
                </div>
              )}
              <div className="spotlight-card-body">
                <h3>{item.title}</h3>
                {item.description && <p>{item.description}</p>}
                <p style={{ color: '#888', fontSize: 12 }}>
                  {item.fileName || 'PDF'}
                  {item.fileSize ? ` · ${formatSize(item.fileSize)}` : ''}
                  {item.published === false ? ' · Hidden' : ' · Live'}
                </p>
                <div className="spotlight-actions">
                  <a
                    href={item.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="admin-btn admin-btn-primary"
                    style={{ padding: '7px 12px', fontSize: 12 }}
                  >
                    Open PDF
                  </a>
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
