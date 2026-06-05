import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

const CATEGORIES = ['Images', 'Articles', 'Presentations'];

const inputStyle = {
  padding: '12px',
  border: '1px solid #ddd',
  borderRadius: '6px',
  fontSize: '14px',
  width: '100%',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  marginBottom: '6px',
  fontWeight: '600',
  fontSize: '0.85rem',
  color: '#333',
};

export default function BlogAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Articles',
    content: '',
    shortTitle: '',
    detailTitle: '',
    coverText: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [slideFiles, setSlideFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [existingSlides, setExistingSlides] = useState([]);

  const fetchItems = async () => {
    try {
      const { data } = await api.get('/blog');
      setItems(data);
    } catch (e) {
      console.error('Failed to fetch blogs:', e);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category') {
      setGalleryFiles([]);
      setSlideFiles([]);
      setImageFile(null);
    }
    setForm({ ...form, [name]: value });
  };

  const resetForm = () => {
    setForm({ title: '', description: '', category: 'Articles', content: '', shortTitle: '', detailTitle: '', coverText: '' });
    setImageFile(null);
    setGalleryFiles([]);
    setSlideFiles([]);
    setExistingImages([]);
    setExistingSlides([]);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setForm({
      title: item.title || '',
      description: item.description || '',
      category: item.category || 'Articles',
      content: (item.content || []).join('\n\n'),
      shortTitle: item.shortTitle || '',
      detailTitle: item.detailTitle || '',
      coverText: item.coverText || '',
    });
    setExistingImages(item.images || []);
    setExistingSlides(item.slides || []);
    setImageFile(null);
    setGalleryFiles([]);
    setSlideFiles([]);
    setEditingId(item._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('category', form.category);

      if (imageFile) fd.append('image', imageFile);

      if (form.category === 'Articles') {
        const paragraphs = form.content.split('\n').filter((l) => l.trim());
        fd.append('content', JSON.stringify(paragraphs));
      }

      if (form.category === 'Images') {
        fd.append('shortTitle', form.shortTitle);
        fd.append('detailTitle', form.detailTitle);
        fd.append('existingImages', JSON.stringify(existingImages));
        galleryFiles.forEach((f) => fd.append('images', f));
      }

      if (form.category === 'Presentations') {
        fd.append('coverText', form.coverText);
        fd.append('detailTitle', form.detailTitle);
        fd.append('existingSlides', JSON.stringify(existingSlides));
        slideFiles.forEach((f) => fd.append('slides', f));
      }

      if (editingId) {
        await api.put(`/admin/blog/${editingId}`, fd);
      } else {
        await api.post('/admin/blog', fd);
      }

      await fetchItems();
      resetForm();
    } catch (e) {
      alert(editingId ? 'Update failed' : 'Create failed');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this blog post?')) return;
    try {
      await api.delete(`/admin/blog/${id}`);
      await fetchItems();
    } catch (e) {
      alert('Delete failed');
    }
  };

  const removeExistingImage = (idx) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeExistingSlide = (idx) => {
    setExistingSlides((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <div style={{ maxWidth: 1200, margin: '0 auto 20px', padding: '0 20px', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}
          style={{
            padding: '10px 20px',
            background: showForm ? '#e5e5e5' : '#111',
            color: showForm ? '#111' : '#fff',
            border: '1px solid #111',
            borderRadius: '999px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          {showForm ? 'Cancel' : 'Add Post'}
        </button>
      </div>

      {showForm && (
        <div style={{ maxWidth: 800, margin: '20px auto', padding: '24px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 20px', color: '#333' }}>
            {editingId ? 'Edit Blog Post' : 'Add New Blog Post'}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
            {/* Category selector */}
            <div>
              <label style={labelStyle}>Category *</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                style={inputStyle}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Common fields */}
            <div>
              <label style={labelStyle}>Title *</label>
              <input name="title" value={form.title} onChange={handleChange} style={inputStyle} required />
            </div>

            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                placeholder="Brief summary shown on listing cards"
              />
            </div>

            <div>
              <label style={labelStyle}>Cover Image {!editingId && '*'}</label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                style={inputStyle}
                required={!editingId}
              />
              {editingId && items.find((i) => i._id === editingId)?.image && (
                <img
                  src={items.find((i) => i._id === editingId).image}
                  alt="Current cover"
                  style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 6, marginTop: 8 }}
                />
              )}
            </div>

            {/* Article-specific */}
            {form.category === 'Articles' && (
              <div>
                <label style={labelStyle}>Content (separate paragraphs with blank lines)</label>
                <textarea
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  style={{ ...inputStyle, minHeight: '200px', resize: 'vertical' }}
                  placeholder="Write your article content here. Each paragraph should be separated by a blank line."
                />
              </div>
            )}

            {/* Image-specific */}
            {form.category === 'Images' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Short Title (for cards)</label>
                    <input name="shortTitle" value={form.shortTitle} onChange={handleChange} style={inputStyle} placeholder="e.g. Structured Living in Wood" />
                  </div>
                  <div>
                    <label style={labelStyle}>Detail Title (for detail page)</label>
                    <input name="detailTitle" value={form.detailTitle} onChange={handleChange} style={inputStyle} placeholder="e.g. A study in balance..." />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Gallery Images (for carousel)</label>
                  <input
                    type="file"
                    name="images"
                    accept="image/*"
                    multiple
                    onChange={(e) => setGalleryFiles(Array.from(e.target.files))}
                    style={inputStyle}
                  />
                  <p style={{ margin: '6px 0 0', fontSize: '0.78rem', color: '#888' }}>
                    Cover image is automatically included. Add extra images for the carousel here.
                  </p>
                </div>
                {existingImages.length > 0 && (
                  <div>
                    <label style={labelStyle}>Existing Gallery Images</label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {existingImages.map((url, idx) => (
                        <div key={idx} style={{ position: 'relative' }}>
                          <img src={url} alt="" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 4 }} />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(idx)}
                            style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#e00', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '11px', lineHeight: '20px', textAlign: 'center' }}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Presentation-specific */}
            {form.category === 'Presentations' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Cover Text (overlay on card)</label>
                    <textarea
                      name="coverText"
                      value={form.coverText}
                      onChange={handleChange}
                      style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
                      placeholder="e.g. Controlled Form in&#10;Compact Space"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Detail Title</label>
                    <input name="detailTitle" value={form.detailTitle} onChange={handleChange} style={inputStyle} placeholder="Shown on detail page" />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Presentation Slides</label>
                  <input
                    type="file"
                    name="slides"
                    accept="image/*"
                    multiple
                    onChange={(e) => setSlideFiles(Array.from(e.target.files))}
                    style={inputStyle}
                  />
                  <p style={{ margin: '6px 0 0', fontSize: '0.78rem', color: '#888' }}>
                    Upload all slide images in order. They will be displayed vertically on the detail page.
                  </p>
                </div>
                {existingSlides.length > 0 && (
                  <div>
                    <label style={labelStyle}>Existing Slides</label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {existingSlides.map((url, idx) => (
                        <div key={idx} style={{ position: 'relative' }}>
                          <img src={url} alt="" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 4 }} />
                          <button
                            type="button"
                            onClick={() => removeExistingSlide(idx)}
                            style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#e00', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '11px', lineHeight: '20px', textAlign: 'center' }}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  background: loading ? '#d4d4d4' : '#111',
                  color: '#fff',
                  border: '1px solid #111',
                  borderRadius: '999px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                }}
              >
                {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: '12px 24px',
                  background: '#fff',
                  color: '#111',
                  border: '1px solid #111',
                  borderRadius: '999px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts grid */}
      <div style={{ maxWidth: 1200, margin: '20px auto', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {items.map((item) => (
            <div
              key={item._id}
              style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              <div style={{ aspectRatio: '4 / 3', overflow: 'hidden', background: '#f6f6f6', position: 'relative' }}>
                <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span style={{
                  position: 'absolute', top: 10, right: 10,
                  background: item.category === 'Images' ? '#2563eb' : item.category === 'Presentations' ? '#7c3aed' : '#059669',
                  color: '#fff', padding: '3px 10px', borderRadius: '999px', fontSize: '0.68rem', fontWeight: 600,
                }}>
                  {item.category}
                </span>
              </div>
              <div style={{ padding: '16px 20px' }}>
                <h3 style={{ margin: '0 0 6px', color: '#333', fontSize: '1rem', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {item.title}
                </h3>
                {item.description && (
                  <p style={{ margin: '0 0 10px', color: '#666', fontSize: '0.82rem', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.description}
                  </p>
                )}
                <p style={{ margin: '0 0 12px', color: '#999', fontSize: '0.75rem' }}>
                  {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {item.category === 'Images' && item.images?.length > 0 && ` • ${item.images.length} images`}
                  {item.category === 'Presentations' && item.slides?.length > 0 && ` • ${item.slides.length} slides`}
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleEdit(item)}
                    style={{ flex: 1, padding: '8px 12px', background: '#111', color: '#fff', border: '1px solid #111', borderRadius: '999px', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    style={{ flex: 1, padding: '8px 12px', background: '#fff', color: '#111', border: '1px solid #111', borderRadius: '999px', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
            <h3>No blog posts yet</h3>
            <p>Click "Add Post" to create your first blog post.</p>
          </div>
        )}
      </div>
    </div>
  );
}
