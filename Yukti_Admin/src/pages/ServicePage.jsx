import React, { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function ServicePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [capabilityBlocks, setCapabilityBlocks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  const [form, setForm] = useState({
    label: '',
    theme: 'dark',
    heading: '',
    description: '',
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/service-page');
      setCapabilityBlocks(data.capabilityBlocks || []);
    } catch {
      alert('Failed to load service page');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setForm({ label: '', theme: 'dark', heading: '', description: '' });
    setImageFiles([]);
    setExistingImages([]);
    setEditingIndex(null);
    setShowForm(false);
  };

  const handleEdit = (block, index) => {
    setForm({
      label: block.label || '',
      theme: block.theme || 'dark',
      heading: (block.headingLines || []).join('\n'),
      description: (block.paragraphs || []).join('\n\n'),
    });
    setExistingImages(block.images || []);
    setImageFiles([]);
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleSaveSection = async () => {
    if (!form.label.trim()) {
      alert('Please enter a section name');
      return;
    }

    const headingLines = form.heading
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const paragraphs = form.description
      .split(/\n\s*\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    let uploadedImages = [...existingImages];
    if (imageFiles.length > 0) {
      for (const file of imageFiles) {
        try {
          const fd = new FormData();
          fd.append('file', file);
          const { data } = await api.post('/upload', fd);
          if (data?.url) {
            uploadedImages.push({ src: data.url, alt: form.label });
          }
        } catch {
          alert(`Failed to upload ${file.name}`);
        }
      }
    }

    const id =
      editingIndex != null
        ? capabilityBlocks[editingIndex].id
        : form.label.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();

    const section = {
      id,
      theme: form.theme,
      number:
        editingIndex != null
          ? capabilityBlocks[editingIndex].number
          : String(capabilityBlocks.length + 1).padStart(2, '0'),
      label: form.label.toUpperCase(),
      headingLines,
      paragraphs,
      images: uploadedImages,
    };

    let updated;
    if (editingIndex != null) {
      updated = capabilityBlocks.map((b, i) => (i === editingIndex ? section : b));
    } else {
      updated = [...capabilityBlocks, section];
    }

    setSaving(true);
    try {
      const { data } = await api.put('/admin/service-page', { capabilityBlocks: updated });
      setCapabilityBlocks(data.capabilityBlocks || updated);
      resetForm();
    } catch {
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (index) => {
    if (!confirm('Delete this section?')) return;
    const updated = capabilityBlocks.filter((_, i) => i !== index);
    const renumbered = updated.map((b, i) => ({
      ...b,
      number: String(i + 1).padStart(2, '0'),
    }));

    setSaving(true);
    try {
      const { data } = await api.put('/admin/service-page', { capabilityBlocks: renumbered });
      setCapabilityBlocks(data.capabilityBlocks || renumbered);
    } catch {
      alert('Delete failed');
    } finally {
      setSaving(false);
    }
  };

  const removeExistingImage = (imgIndex) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== imgIndex));
  };

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: '#666' }}>
        Loading service page…
      </div>
    );
  }

  return (
    <div>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto 20px auto',
        padding: '0 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h2 style={{ margin: 0, color: '#333' }}>Service Page Sections</h2>
          <p style={{ margin: '4px 0 0 0', color: '#888', fontSize: 13 }}>
            Add or edit the capability sections shown on the public Service page.
          </p>
        </div>
        <button
          onClick={() => {
            if (showForm) { resetForm(); } else { setShowForm(true); }
          }}
          style={{
            padding: '10px 20px',
            background: showForm ? '#e5e5e5' : '#111111',
            color: showForm ? '#111111' : '#ffffff',
            border: '1px solid #111111',
            borderRadius: '999px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          {showForm ? 'Cancel' : 'Add Section'}
        </button>
      </div>

      {showForm && (
        <div style={{
          maxWidth: 800,
          margin: '20px auto',
          padding: '20px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>
            {editingIndex != null ? 'Edit Section' : 'Add New Section'}
          </h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={fieldLabel}>Section Name *</label>
                <input
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder="e.g. Lathe, Prototyping, CNC"
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={fieldLabel}>Background Style</label>
                <select
                  value={form.theme}
                  onChange={(e) => setForm({ ...form, theme: e.target.value })}
                  style={inputStyle}
                >
                  <option value="dark">Dark background</option>
                  <option value="light">Light background</option>
                </select>
              </div>
            </div>

            <div>
              <label style={fieldLabel}>Heading *</label>
              <textarea
                value={form.heading}
                onChange={(e) => setForm({ ...form, heading: e.target.value })}
                placeholder="e.g. Precision Shaping For&#10;Structural Components"
                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                required
              />
              <p style={hintStyle}>Each line appears on its own line in the heading.</p>
            </div>

            <div>
              <label style={fieldLabel}>Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Write one or more paragraphs describing this capability..."
                style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
                required
              />
              <p style={hintStyle}>Leave a blank line between paragraphs if you want multiple.</p>
            </div>

            <div>
              <label style={fieldLabel}>
                Images {editingIndex != null ? '(add more)' : '*'}
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
                style={{
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px',
                }}
              />
              <p style={hintStyle}>Select one or more images for this section.</p>
            </div>

            {existingImages.length > 0 && (
              <div>
                <label style={fieldLabel}>Current Images</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {existingImages.map((img, idx) => (
                    <div
                      key={img.src + idx}
                      style={{
                        position: 'relative',
                        width: 90,
                        borderRadius: 8,
                        border: '1px solid #e5e5e5',
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={img.src}
                        alt={img.alt || ''}
                        style={{
                          width: '100%',
                          height: 64,
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(idx)}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '4px 0',
                          border: 'none',
                          background: '#fff1f2',
                          color: '#b91c1c',
                          fontSize: 11,
                          cursor: 'pointer',
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: 4 }}>
              <button
                type="button"
                onClick={handleSaveSection}
                disabled={saving}
                style={{
                  padding: '12px 24px',
                  background: saving ? '#d4d4d4' : '#111111',
                  color: '#ffffff',
                  border: '1px solid #111111',
                  borderRadius: '999px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                }}
              >
                {saving ? 'Saving...' : editingIndex != null ? 'Update Section' : 'Create Section'}
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
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: '20px auto', padding: '0 20px' }}>
        {capabilityBlocks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
            <h3>No sections yet</h3>
            <p>Click "Add Section" to create your first capability section.</p>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '20px',
        }}>
          {capabilityBlocks.map((block, bi) => (
            <div
              key={block.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              {block.images?.[0]?.src && (
                <div style={{
                  height: 160,
                  overflow: 'hidden',
                  background: block.theme === 'dark' ? '#111' : '#f6f6f6',
                }}>
                  <img
                    src={block.images[0].src}
                    alt={block.images[0].alt || block.label}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}
              <div style={{ padding: '20px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}>
                  <h3 style={{ margin: 0, color: '#333', fontSize: '1.1rem' }}>
                    {block.number} — {block.label}
                  </h3>
                  <span style={{
                    background: block.theme === 'dark' ? '#111' : '#f0f0f0',
                    color: block.theme === 'dark' ? '#fff' : '#333',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}>
                    {block.theme}
                  </span>
                </div>

                {block.headingLines?.length > 0 && (
                  <p style={{
                    margin: '0 0 8px 0',
                    color: '#555',
                    fontSize: '0.9rem',
                    fontStyle: 'italic',
                  }}>
                    {block.headingLines.join(' ')}
                  </p>
                )}

                {block.paragraphs?.length > 0 && (
                  <p style={{
                    margin: '0 0 12px 0',
                    color: '#666',
                    fontSize: '0.85rem',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {block.paragraphs[0]}
                  </p>
                )}

                {block.images?.length > 1 && (
                  <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                    {block.images.map((img, idx) => (
                      <img
                        key={img.src + idx}
                        src={img.src}
                        alt={img.alt || ''}
                        style={{
                          width: 40,
                          height: 40,
                          objectFit: 'cover',
                          borderRadius: 6,
                          border: idx === 0 ? '2px solid #111' : '1px solid #e5e5e5',
                        }}
                      />
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleEdit(block, bi)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: '#111111',
                      color: '#ffffff',
                      border: '1px solid #111111',
                      borderRadius: '999px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(bi)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: '#ffffff',
                      color: '#111111',
                      border: '1px solid #111111',
                      borderRadius: '999px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
const fieldLabel = {
  display: 'block',
  marginBottom: '6px',
  color: '#444',
  fontSize: '13px',
  fontWeight: 600,
};

const hintStyle = {
  margin: '4px 0 0 0',
  fontSize: '12px',
  color: '#999',
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  border: '1px solid #ddd',
  borderRadius: '6px',
  fontSize: '16px',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

