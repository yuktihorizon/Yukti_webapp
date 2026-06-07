import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function Products() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    series: '',
    category: '',
    price: '',
    description: '',
    backgroundVideoUrl: '',
    dimensionsDetails: '',
    width: '',
    height: '',
    depth: '',
    seatHeight: '',
    specificationsDetails: '',
    material: '',
    frame: '',
    padding: '',
    weightCapacity: '',
    assembly: '',
  });
  const [images, setImages] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [currentImages, setCurrentImages] = useState([]);
  const [backgroundVideoFile, setBackgroundVideoFile] = useState(null);
  const [customCategory, setCustomCategory] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [categoryMessage, setCategoryMessage] = useState({ type: '', text: '' });

  const fetchItems = async () => {
    try {
      const { data } = await api.get('/products/getproducts');
      setItems(data);
    } catch (e) {
      console.error('Failed to fetch products:', e);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/category/getcategories');
      setCategories(data);
    } catch (e) {
      console.error('Failed to fetch categories:', e);
    }
  };

  useEffect(() => { 
    fetchItems(); 
    fetchCategories();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({
      name: '',
      series: '',
      category: '',
      price: '',
      description: '',
      backgroundVideoUrl: '',
      dimensionsDetails: '',
      width: '',
      height: '',
      depth: '',
      seatHeight: '',
      specificationsDetails: '',
      material: '',
      frame: '',
      padding: '',
      weightCapacity: '',
      assembly: '',
    });
    setImages([]);
    setBackgroundVideoFile(null);
    setShowForm(false);
    setEditingId(null);
    setCurrentImages([]);
    setCustomCategory('');
  };

  const handleCreateCategory = async () => {
    const categoryName = customCategory.trim();
    if (!categoryName) {
      alert('Enter a category name');
      return;
    }

    try {
      setCreatingCategory(true);
      setCategoryMessage({ type: '', text: '' });
      const { data } = await api.post('/category/createcategories', { name: categoryName });
      const createdName = data?.name || categoryName;

      setCategories((prev) => {
        const exists = prev.some(
          (cat) => cat.name.toLowerCase().trim() === createdName.toLowerCase().trim()
        );
        if (exists) return prev;
        const next = [...prev, data].sort((a, b) => a.name.localeCompare(b.name));
        return next;
      });

      setForm((prev) => ({ ...prev, category: createdName }));
      setCategoryMessage({ type: 'success', text: `Category "${createdName}" created successfully` });
      setCustomCategory('');
    } catch (e) {
      const message = e?.response?.data?.error || 'Failed to create category';
      setCategoryMessage({ type: 'error', text: message });
      alert(message);
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('series', form.series);
      fd.append('category', typeof form.category === 'object' ? form.category.name : form.category);
      fd.append('price', form.price);
      fd.append('description', form.description);
      fd.append('backgroundVideoUrl', form.backgroundVideoUrl || '');
      if (backgroundVideoFile) {
        fd.append('backgroundVideo', backgroundVideoFile);
      }
      fd.append(
        'dimensions',
        JSON.stringify({
          details: form.dimensionsDetails,
          width: form.width,
          height: form.height,
          depth: form.depth,
          seatHeight: form.seatHeight,
        })
      );
      fd.append(
        'specifications',
        JSON.stringify({
          details: form.specificationsDetails,
          material: form.material,
          frame: form.frame,
          padding: form.padding,
          weightCapacity: form.weightCapacity,
          assembly: form.assembly,
        })
      );
      images.forEach((file) => fd.append('images', file));
      // minimal JSON defaults for fields not yet in UI
      fd.append('colors', JSON.stringify([]));
      if (currentImages.length && editingId) {
        fd.append('imagesOrder', JSON.stringify(currentImages));
      }

      if (editingId) {
        await api.put(`/admin/products/${editingId}`, fd);
      } else {
        await api.post('/admin/products', fd);
      }
      await fetchItems();
      resetForm();
    } catch (e) {
      alert(editingId ? 'Update failed' : 'Create failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete product?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      await fetchItems();
    } catch (e) {
      alert('Delete failed');
    }
  };

  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => {
        const itemCategory = typeof item.category === 'object' ? item.category.name : item.category;
        return itemCategory === selectedCategory;
      });

  const fieldLabelStyle = {
    display: 'block',
    marginBottom: '6px',
    color: '#444',
    fontSize: '13px',
    fontWeight: 600,
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
          {showForm ? 'Cancel' : editingId ? 'Edit Product' : 'Add Product'}
        </button>
      </div>

      {/* Category Filter */}
      <div style={{ 
        maxWidth: 1200, 
        margin: '20px auto', 
        padding: '0 20px'
      }}>
        <div style={{ 
          background: 'white', 
          padding: '16px', 
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontWeight: '600', color: '#333' }}>Filter by Category:</span>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          <span style={{ color: '#666', fontSize: '14px' }}>
            {filteredItems.length} product{filteredItems.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Category Management */}
        <div style={{ 
          background: 'white', 
          padding: '16px', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <div style={{ marginBottom: '10px' }}>
            <h4 style={{ margin: 0, color: '#333' }}>Add Category</h4>
            <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '13px' }}>
              Create categories first, then use them while adding products.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="Enter category name"
              style={{
                flex: 1,
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            <button
              type="button"
              onClick={handleCreateCategory}
              disabled={creatingCategory}
              style={{
                padding: '10px 16px',
                background: '#111111',
                color: '#ffffff',
                border: '1px solid #111111',
                borderRadius: '999px',
                cursor: creatingCategory ? 'not-allowed' : 'pointer',
                fontWeight: '600'
              }}
            >
              {creatingCategory ? 'Adding...' : 'Add Category'}
            </button>
          </div>
          {categoryMessage.text && (
            <p
              style={{
                margin: '10px 0 0 0',
                fontSize: '13px',
                color: categoryMessage.type === 'success' ? '#166534' : '#b91c1c',
              }}
            >
              {categoryMessage.text}
            </p>
          )}
          <div style={{ marginTop: '12px' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#444', fontWeight: 600 }}>
              Available Categories
            </p>
            {categories.length === 0 ? (
              <p style={{ margin: 0, fontSize: '13px', color: '#777' }}>No categories created yet.</p>
            ) : (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {categories.map((cat) => (
                  <span
                    key={cat._id || cat.name}
                    style={{
                      background: '#f5f5f5',
                      border: '1px solid #e5e5e5',
                      borderRadius: '999px',
                      padding: '4px 10px',
                      fontSize: '12px',
                      color: '#333',
                    }}
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ 
          maxWidth: 800, 
          margin: '0 auto 20px auto', 
          padding: '20px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>
            {editingId ? 'Edit Product' : 'Add New Product'}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <input 
                name="name" 
                placeholder="Product Name" 
                value={form.name} 
                onChange={handleChange}
                style={{
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
                required 
              />
              <input 
                name="series" 
                placeholder="Series (optional)" 
                value={form.series} 
                onChange={handleChange}
                style={{
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <select 
                name="category" 
                value={form.category} 
                onChange={handleChange}
                style={{
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              <input 
                name="price" 
                placeholder="Price (₹)" 
                type="number" 
                value={form.price} 
                onChange={handleChange}
                style={{
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
                required 
              />
            </div>
            <textarea 
              name="description" 
              placeholder="Product Description" 
              value={form.description} 
              onChange={handleChange}
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
                minHeight: '80px',
                resize: 'vertical'
              }}
              required
            />
            <div style={{
              border: '1px solid #e5e5e5',
              borderRadius: '10px',
              padding: '14px',
              background: '#fafafa'
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#222' }}>Product page background video</h4>
              <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#555', lineHeight: 1.5 }}>
                Paste a YouTube link or a direct video URL (e.g. Cloudinary). Shown full-screen behind the product.
                Optional — chair products without a URL still use the default loop.
              </p>
              <label style={fieldLabelStyle} htmlFor="backgroundVideoUrl">Background video URL</label>
              <input
                id="backgroundVideoUrl"
                name="backgroundVideoUrl"
                placeholder="https://www.youtube.com/watch?v=… or https://…/video.mp4"
                value={form.backgroundVideoUrl}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '15px',
                  boxSizing: 'border-box',
                }}
              />
              <label style={{ ...fieldLabelStyle, marginTop: '12px' }} htmlFor="backgroundVideoFile">
                Or upload a video file
              </label>
              <input
                id="backgroundVideoFile"
                type="file"
                accept="video/*"
                onChange={(e) => setBackgroundVideoFile(e.target.files?.[0] || null)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{
              border: '1px solid #e5e5e5',
              borderRadius: '10px',
              padding: '14px',
              background: '#fafafa'
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#222' }}>Dimensions</h4>
              <div style={{ marginBottom: '12px' }}>
                <label style={fieldLabelStyle} htmlFor="dimensionsDetails">Notes</label>
                <textarea
                  id="dimensionsDetails"
                  name="dimensionsDetails"
                  placeholder="Any additional size details"
                  value={form.dimensionsDetails}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '15px',
                    minHeight: '64px',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={fieldLabelStyle} htmlFor="width">Width</label>
                  <input
                    id="width"
                    name="width"
                    placeholder="e.g. 60 cm"
                    value={form.width}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '15px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={fieldLabelStyle} htmlFor="height">Height</label>
                  <input
                    id="height"
                    name="height"
                    placeholder="e.g. 85 cm"
                    value={form.height}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '15px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={fieldLabelStyle} htmlFor="depth">Depth</label>
                  <input
                    id="depth"
                    name="depth"
                    placeholder="e.g. 55 cm"
                    value={form.depth}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '15px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={fieldLabelStyle} htmlFor="seatHeight">Seat Height</label>
                  <input
                    id="seatHeight"
                    name="seatHeight"
                    placeholder="e.g. 45 cm"
                    value={form.seatHeight}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '15px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            </div>
            <div style={{
              border: '1px solid #e5e5e5',
              borderRadius: '10px',
              padding: '14px',
              background: '#fafafa'
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#222' }}>Specifications</h4>
              <div style={{ marginBottom: '12px' }}>
                <label style={fieldLabelStyle} htmlFor="specificationsDetails">Notes</label>
                <textarea
                  id="specificationsDetails"
                  name="specificationsDetails"
                  placeholder="Any additional specification details"
                  value={form.specificationsDetails}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '15px',
                    minHeight: '64px',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={fieldLabelStyle} htmlFor="material">Material</label>
                  <input
                    id="material"
                    name="material"
                    placeholder="e.g. Solid wood"
                    value={form.material}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '15px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={fieldLabelStyle} htmlFor="frame">Frame</label>
                  <input
                    id="frame"
                    name="frame"
                    placeholder="e.g. Metal frame"
                    value={form.frame}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '15px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={fieldLabelStyle} htmlFor="padding">Padding</label>
                  <input
                    id="padding"
                    name="padding"
                    placeholder="e.g. High-density foam"
                    value={form.padding}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '15px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={fieldLabelStyle} htmlFor="weightCapacity">Weight Capacity</label>
                  <input
                    id="weightCapacity"
                    name="weightCapacity"
                    placeholder="e.g. 120 kg"
                    value={form.weightCapacity}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '15px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={fieldLabelStyle} htmlFor="assembly">Assembly</label>
                  <input
                    id="assembly"
                    name="assembly"
                    placeholder="e.g. Self assembly required"
                    value={form.assembly}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '15px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                {editingId ? 'Add more images (optional)' : 'Product Images *'}
              </label>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={(e) => setImages(Array.from(e.target.files || []))}
                style={{
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
                required={!editingId}
              />
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
                Select multiple images for the product
              </p>
            </div>

            {editingId && currentImages.length > 0 && (
              <div>
                <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#333', fontWeight: 600 }}>
                  Existing images (drag order via controls):
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {currentImages.map((img, index) => (
                    <div
                      key={img}
                      style={{
                        width: 72,
                        borderRadius: 8,
                        border: index === 0 ? '2px solid #111111' : '1px solid #e5e5e5',
                        padding: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <img
                        src={img}
                        alt={`Image ${index + 1}`}
                        style={{
                          width: '100%',
                          height: 48,
                          objectFit: 'cover',
                          borderRadius: 4,
                        }}
                      />
                      <span style={{ fontSize: 11, color: '#555' }}>#{index + 1}</span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          type="button"
                          onClick={() => {
                            if (index === 0) return;
                            const next = [...currentImages];
                            const [moved] = next.splice(index, 1);
                            next.splice(index - 1, 0, moved);
                            setCurrentImages(next);
                          }}
                          disabled={index === 0}
                          style={{
                            border: '1px solid #ddd',
                            background: '#fff',
                            borderRadius: 4,
                            padding: '2px 4px',
                            fontSize: 10,
                            cursor: index === 0 ? 'default' : 'pointer',
                          }}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (index === currentImages.length - 1) return;
                            const next = [...currentImages];
                            const [moved] = next.splice(index, 1);
                            next.splice(index + 1, 0, moved);
                            setCurrentImages(next);
                          }}
                          disabled={index === currentImages.length - 1}
                          style={{
                            border: '1px solid #ddd',
                            background: '#fff',
                            borderRadius: 4,
                            padding: '2px 4px',
                            fontSize: 10,
                            cursor: index === currentImages.length - 1 ? 'default' : 'pointer',
                          }}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const confirmed = window.confirm('Remove this image from the product?');
                            if (!confirmed) return;
                            setCurrentImages(currentImages.filter((url) => url !== img));
                          }}
                          style={{
                            border: '1px solid #f87171',
                            background: '#fff1f2',
                            color: '#b91c1c',
                            borderRadius: 4,
                            padding: '2px 4px',
                            fontSize: 10,
                            cursor: 'pointer',
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                {loading ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
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

      {/* Products Grid */}
      <div style={{ 
        maxWidth: 1200, 
        margin: '0 auto', 
        padding: '0 20px 20px 20px'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '20px' 
        }}>
          {filteredItems.map((item) => (
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
                aspectRatio: '1/1', 
                overflow: 'hidden', 
                background: '#f6f6f6'
              }}>
                <img 
                  src={item.images?.[0]} 
                  alt={item.name} 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }} 
                />
              </div>
              <div style={{ padding: '20px' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '1.1rem' }}>
                  {item.name}
                </h3>
                {item.series && (
                  <p style={{ 
                    margin: '0 0 8px 0', 
                    color: '#666', 
                    fontSize: '0.9rem',
                    fontStyle: 'italic'
                  }}>
                    {item.series}
                  </p>
                )}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <span style={{ 
                    background: '#e9ecef', 
                    color: '#495057', 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>
                    {typeof item.category === 'object' ? item.category.name : item.category}
                  </span>
                  <span style={{ 
                    fontWeight: 'bold', 
                    color: '#111111', 
                    fontSize: '1.1rem'
                  }}>
                    ₹{item.price}
                  </span>
                </div>
                {/* Existing description */}
                {item.description && (
                  <p style={{ 
                    margin: '0 0 16px 0', 
                    color: '#555', 
                    fontSize: '0.9rem',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {item.description}
                  </p>
                )}
                {/* Existing images preview */}
                {Array.isArray(item.images) && item.images.length > 1 && (
                  <div style={{ marginBottom: '12px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {item.images.slice(0, 5).map((img, idx) => (
                      <img
                        key={img}
                        src={img}
                        alt={`${item.name} ${idx + 1}`}
                        style={{
                          width: 40,
                          height: 40,
                          objectFit: 'cover',
                          borderRadius: 6,
                          border: idx === 0 ? '2px solid #111111' : '1px solid #e5e5e5',
                        }}
                      />
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    type="button"
                    onClick={() => {
                      setEditingId(item._id);
                      setShowForm(true);
                      setBackgroundVideoFile(null);
                      setForm({
                        name: item.name || '',
                        series: item.series || '',
                        category: typeof item.category === 'object' ? item.category.name : item.category || '',
                        price: item.price || '',
                        description: item.description || '',
                        backgroundVideoUrl: item.backgroundVideoUrl || item.videoUrl || '',
                        dimensionsDetails: item.dimensions?.details || '',
                        width: item.dimensions?.width || '',
                        height: item.dimensions?.height || '',
                        depth: item.dimensions?.depth || '',
                        seatHeight: item.dimensions?.seatHeight || '',
                        specificationsDetails: item.specifications?.details || '',
                        material: item.specifications?.material || '',
                        frame: item.specifications?.frame || '',
                        padding: item.specifications?.padding || '',
                        weightCapacity: item.specifications?.weightCapacity || '',
                        assembly: item.specifications?.assembly || '',
                      });
                      setImages([]);
                      setCurrentImages(Array.isArray(item.images) ? item.images : []);
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: '#111111',
                      color: '#ffffff',
                      border: '1px solid #111111',
                      borderRadius: '999px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    Edit
                  </button>
                  {/* Simple primary image reorder: move first image to end / clicked one to front could be added here later */}
                  <button 
                    type="button"
                    onClick={() => handleDelete(item._id)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: '#ffffff',
                      color: '#111111',
                      border: '1px solid #111111',
                      borderRadius: '999px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredItems.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            color: '#666'
          }}>
            <h3>No products found</h3>
            <p>
              {selectedCategory === 'all' 
                ? 'Click "Add Product" to create your first product.' 
                : `No products in the "${selectedCategory}" category.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
