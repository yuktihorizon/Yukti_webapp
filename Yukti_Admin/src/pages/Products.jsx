import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

const MAIN_CATEGORIES = [
  'Consumer Products',
  'Industrial Products',
  'Industrial Services',
  'Digital Products',
];

/** Flat mains: no sub-categories or dimensions (products sit directly under the main). */
const FLAT_MAIN_CATEGORIES = ['Industrial Products'];
const isFlatMainCategory = (main) => FLAT_MAIN_CATEGORIES.includes(main);

const EMPTY_ATTRIBUTE_ROW = { label: '', value: '' };

const LEGACY_LABELS = {
  width: 'Width',
  height: 'Height',
  depth: 'Depth',
  seatHeight: 'Seat Height',
  material: 'Material',
  frame: 'Frame',
  padding: 'Padding',
  weightCapacity: 'Weight Capacity',
  assembly: 'Assembly',
};

const formatLegacyKey = (rawKey) => {
  if (!rawKey || typeof rawKey !== 'string') return '';
  const spaced = rawKey
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .trim();
  return spaced
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const attributesToRows = (data) => {
  if (!data) return [{ ...EMPTY_ATTRIBUTE_ROW }];

  if (Array.isArray(data)) {
    const rows = data
      .filter((item) => item?.label || item?.value)
      .map((item) => ({ label: item.label || '', value: item.value || '' }));
    return rows.length ? rows : [{ ...EMPTY_ATTRIBUTE_ROW }];
  }

  if (typeof data === 'object') {
    const rows = Object.entries(data)
      .filter(([key, val]) => key.toLowerCase() !== 'details' && val != null && String(val).trim())
      .map(([key, val]) => ({
        label: LEGACY_LABELS[key] || formatLegacyKey(key),
        value: String(val),
      }));
    return rows.length ? rows : [{ ...EMPTY_ATTRIBUTE_ROW }];
  }

  return [{ ...EMPTY_ATTRIBUTE_ROW }];
};

const rowsToPayload = (rows) =>
  rows
    .map((row) => ({ label: row.label.trim(), value: row.value.trim() }))
    .filter((row) => row.label && row.value);

/** Parse pasted specs/dimensions into label/value rows.
 * Supports lines like:
 *   Width: 60 cm
 *   Height - 120 cm
 *   Material | Solid wood
 *   Seat Height	45 cm   (tab)
 *   Depth 40 cm
 */
const parseAttributeBlock = (text) => {
  if (!text || typeof text !== 'string') return [];

  const lines = text
    .split(/\r?\n/)
    .map((line) =>
      line
        .replace(/^[\s•\-–—*·▪▸►]+/, '')
        .replace(/\s+$/, '')
        .trim()
    )
    .filter(Boolean);

  const rows = [];
  for (const line of lines) {
    if (line.includes('\t')) {
      const [rawLabel, ...rest] = line.split('\t');
      const label = rawLabel.trim();
      const value = rest.join('\t').trim();
      if (label && value) rows.push({ label, value });
      continue;
    }

    const colon = line.match(/^(.{1,80}?)\s*[:：]\s*(.+)$/);
    if (colon) {
      rows.push({ label: colon[1].trim(), value: colon[2].trim() });
      continue;
    }

    const pipe = line.match(/^(.{1,80}?)\s*\|\s*(.+)$/);
    if (pipe) {
      rows.push({ label: pipe[1].trim(), value: pipe[2].trim() });
      continue;
    }

    const dash = line.match(/^(.{1,80}?)\s+[–—−-]\s+(.+)$/);
    if (dash) {
      rows.push({ label: dash[1].trim(), value: dash[2].trim() });
      continue;
    }

    const doubleSpace = line.match(/^([A-Za-z][A-Za-z0-9 /&()'°.]{0,50}?)\s{2,}(.+)$/);
    if (doubleSpace) {
      rows.push({ label: doubleSpace[1].trim(), value: doubleSpace[2].trim() });
      continue;
    }

    const untilDigit = line.match(/^([A-Za-z][A-Za-z0-9 /&()'°.]{0,50}?)\s+(\d.*)$/);
    if (untilDigit) {
      rows.push({ label: untilDigit[1].trim(), value: untilDigit[2].trim() });
    }
  }

  return rows;
};

export default function Products() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(false);
  const [form, setForm] = useState({
    name: '',
    series: '',
    category: '',
    price: '',
    description: '',
    backgroundVideoUrl: '',
    homeOrder: '',
  });
  const [dimensionRows, setDimensionRows] = useState([{ ...EMPTY_ATTRIBUTE_ROW }]);
  const [specificationRows, setSpecificationRows] = useState([{ ...EMPTY_ATTRIBUTE_ROW }]);
  const [dimensionPaste, setDimensionPaste] = useState('');
  const [specificationPaste, setSpecificationPaste] = useState('');
  const [images, setImages] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMainCategory, setSelectedMainCategory] = useState('all');
  const [newCategoryMainCategory, setNewCategoryMainCategory] = useState('Consumer Products');
  const [formMainCategory, setFormMainCategory] = useState('Consumer Products');
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
      setListError(false);
      return true;
    } catch (e) {
      console.error('Failed to fetch products:', e);
      return false;
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
    const load = async () => {
      setListLoading(true);
      const ok = await fetchItems();
      await fetchCategories();
      if (!ok) setListError(true);
      setListLoading(false);
    };
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAttributeRowChange = (setter, index, field, value) => {
    setter((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const addAttributeRow = (setter) => {
    setter((prev) => [...prev, { ...EMPTY_ATTRIBUTE_ROW }]);
  };

  const removeAttributeRow = (setter, index) => {
    setter((prev) => (prev.length === 1 ? [{ ...EMPTY_ATTRIBUTE_ROW }] : prev.filter((_, i) => i !== index)));
  };

  const applyAttributePaste = (setter, pasteText, clearPaste) => {
    const parsed = parseAttributeBlock(pasteText);
    if (!parsed.length) {
      alert(
        'Could not parse that text.\n\nPaste one item per line, for example:\nWidth: 60 cm\nHeight: 120 cm\nMaterial: Solid wood'
      );
      return;
    }
    setter(parsed);
    clearPaste('');
  };

  const resetForm = () => {
    setForm({
      name: '',
      series: '',
      category: '',
      price: '',
      description: '',
      backgroundVideoUrl: '',
      homeOrder: '',
    });
    setDimensionRows([{ ...EMPTY_ATTRIBUTE_ROW }]);
    setSpecificationRows([{ ...EMPTY_ATTRIBUTE_ROW }]);
    setDimensionPaste('');
    setSpecificationPaste('');
    setImages([]);
    setBackgroundVideoFile(null);
    setShowForm(false);
    setEditingId(null);
    setCurrentImages([]);
    setCustomCategory('');
    setFormMainCategory(
      selectedMainCategory !== 'all' ? selectedMainCategory : 'Consumer Products'
    );
  };

  const handleCreateCategory = async () => {
    if (isFlatMainCategory(newCategoryMainCategory)) {
      alert(`${newCategoryMainCategory} does not use sub-categories`);
      return;
    }

    const categoryName = customCategory.trim();
    if (!categoryName) {
      alert('Enter a category name');
      return;
    }

    try {
      setCreatingCategory(true);
      setCategoryMessage({ type: '', text: '' });
      const { data } = await api.post('/category/createcategories', {
        name: categoryName,
        mainCategory: newCategoryMainCategory,
      });
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
      setFormMainCategory(newCategoryMainCategory);
      setCategoryMessage({
        type: 'success',
        text: `Sub-category "${createdName}" created under ${newCategoryMainCategory}`,
      });
      setCustomCategory('');
    } catch (e) {
      const message = e?.response?.data?.error || 'Failed to create category';
      setCategoryMessage({ type: 'error', text: message });
      alert(message);
    } finally {
      setCreatingCategory(false);
    }
  };

  /** Ensure a single bucket category exists for flat mains (e.g. Industrial Products). */
  const ensureFlatMainCategory = async (mainCategory) => {
    const existing = categories.find((cat) => cat.mainCategory === mainCategory);
    if (existing) return existing.name;

    try {
      const { data } = await api.post('/category/createcategories', {
        name: mainCategory,
        mainCategory,
      });
      setCategories((prev) => {
        const exists = prev.some((cat) => cat._id === data._id || cat.name === data.name);
        if (exists) return prev;
        return [...prev, data].sort((a, b) => a.name.localeCompare(b.name));
      });
      return data.name || mainCategory;
    } catch (e) {
      // Race: category may already exist from another request
      await fetchCategories();
      const { data: fresh } = await api.get('/category/getcategories');
      const found = (fresh || []).find((cat) => cat.mainCategory === mainCategory);
      if (found) {
        setCategories(fresh);
        return found.name;
      }
      throw e;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const flat = isFlatMainCategory(formMainCategory);
      let categoryName = typeof form.category === 'object' ? form.category.name : form.category;
      if (flat) {
        categoryName = await ensureFlatMainCategory(formMainCategory);
      }
      if (!categoryName) {
        alert('Select a sub-category');
        return;
      }

      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('series', form.series);
      fd.append('category', categoryName);
      fd.append('price', form.price);
      fd.append('description', form.description);
      fd.append('homeOrder', form.homeOrder === '' ? '0' : String(form.homeOrder));
      fd.append('backgroundVideoUrl', form.backgroundVideoUrl || '');
      if (backgroundVideoFile) {
        fd.append('backgroundVideo', backgroundVideoFile);
      }
      fd.append(
        'dimensions',
        JSON.stringify(flat ? [] : rowsToPayload(dimensionRows))
      );
      fd.append('specifications', JSON.stringify(rowsToPayload(specificationRows)));
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

  const filteredItems = items
    .filter((item) => {
      const itemCategory = typeof item.category === 'object' ? item.category : null;
      const itemCategoryName = itemCategory?.name || item.category;
      const itemMainCategory = itemCategory?.mainCategory;

      if (selectedMainCategory !== 'all' && itemMainCategory !== selectedMainCategory) {
        return false;
      }
      if (selectedCategory !== 'all' && itemCategoryName !== selectedCategory) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      const orderA = a.homeOrder > 0 ? a.homeOrder : Number.POSITIVE_INFINITY;
      const orderB = b.homeOrder > 0 ? b.homeOrder : Number.POSITIVE_INFINITY;
      if (orderA !== orderB) return orderA - orderB;
      return String(a.name || '').localeCompare(String(b.name || ''));
    });

  const filteredCategoriesForDropdown = selectedMainCategory === 'all'
    ? categories
    : categories.filter((cat) => cat.mainCategory === selectedMainCategory);

  const formSubCategories = categories.filter(
    (cat) => cat.mainCategory === formMainCategory
  );
  const formIsFlat = isFlatMainCategory(formMainCategory);
  const subcategoryMains = MAIN_CATEGORIES.filter((mc) => !isFlatMainCategory(mc));

  const fieldLabelStyle = {
    display: 'block',
    marginBottom: '6px',
    color: '#444',
    fontSize: '13px',
    fontWeight: 600,
  };

  const openAddProductForm = () => {
    const main =
      selectedMainCategory !== 'all' ? selectedMainCategory : 'Consumer Products';
    setFormMainCategory(main);
    setNewCategoryMainCategory(main);
    setEditingId(null);
    setForm({
      name: '',
      series: '',
      category: '',
      price: '',
      description: '',
      backgroundVideoUrl: '',
      homeOrder: '',
    });
    setDimensionRows([{ ...EMPTY_ATTRIBUTE_ROW }]);
    setSpecificationRows([{ ...EMPTY_ATTRIBUTE_ROW }]);
    setDimensionPaste('');
    setSpecificationPaste('');
    setImages([]);
    setBackgroundVideoFile(null);
    setCurrentImages([]);
    setShowForm(true);
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
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              openAddProductForm();
            }
          }}
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
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontWeight: '600', color: '#333' }}>Filter:</span>
          <select 
            value={selectedMainCategory} 
            onChange={(e) => {
              const next = e.target.value;
              setSelectedMainCategory(next);
              setSelectedCategory('all');
              if (next !== 'all') {
                setNewCategoryMainCategory(
                  isFlatMainCategory(next) ? 'Consumer Products' : next
                );
                setFormMainCategory(next);
              }
            }}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value="all">All Main Categories</option>
            {MAIN_CATEGORIES.map((mc) => (
              <option key={mc} value={mc}>{mc}</option>
            ))}
          </select>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              display: isFlatMainCategory(selectedMainCategory) ? 'none' : undefined,
            }}
          >
            <option value="all">All Sub-Categories</option>
            {filteredCategoriesForDropdown.map(cat => (
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
            <h4 style={{ margin: 0, color: '#333' }}>Add Sub-Category</h4>
            <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '13px' }}>
              Consumer Products use sub-categories (e.g. Chairs). Industrial Products
              sit directly under the main category — no sub-categories or dimensions.
              Industrial Services and Digital Products also have their own landing pages.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={
                isFlatMainCategory(newCategoryMainCategory)
                  ? 'Consumer Products'
                  : newCategoryMainCategory
              }
              onChange={(e) => setNewCategoryMainCategory(e.target.value)}
              style={{
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                minWidth: '180px'
              }}
            >
              {subcategoryMains.map((mc) => (
                <option key={mc} value={mc}>{mc}</option>
              ))}
            </select>
            <input
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="Enter sub-category name (e.g. Chairs)"
              style={{
                flex: 1,
                minWidth: '200px',
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
              Available Sub-Categories
            </p>
            {categories.filter((cat) => !isFlatMainCategory(cat.mainCategory)).length === 0 ? (
              <p style={{ margin: 0, fontSize: '13px', color: '#777' }}>No categories created yet.</p>
            ) : (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {categories
                  .filter((cat) => !isFlatMainCategory(cat.mainCategory))
                  .map((cat) => (
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
                    {cat.mainCategory && (
                      <span style={{ color: '#888', marginLeft: '4px' }}>({cat.mainCategory})</span>
                    )}
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
            <div style={{ display: 'grid', gridTemplateColumns: formIsFlat ? '1fr' : '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={fieldLabelStyle}>Main Category *</label>
                <select
                  value={formMainCategory}
                  onChange={(e) => {
                    const next = e.target.value;
                    setFormMainCategory(next);
                    if (!isFlatMainCategory(next)) {
                      setNewCategoryMainCategory(next);
                    }
                    setForm((prev) => ({ ...prev, category: '' }));
                    if (isFlatMainCategory(next)) {
                      setDimensionRows([{ ...EMPTY_ATTRIBUTE_ROW }]);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                  }}
                  required
                >
                  {MAIN_CATEGORIES.map((mc) => (
                    <option key={mc} value={mc}>{mc}</option>
                  ))}
                </select>
              </div>
              {!formIsFlat && (
              <div>
                <label style={fieldLabelStyle}>Sub-Category *</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                  }}
                  required
                >
                  <option value="">
                    {formSubCategories.length === 0
                      ? `No sub-categories under ${formMainCategory}`
                      : 'Select Sub-Category'}
                  </option>
                  {formSubCategories.map((cat) => (
                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              )}
            </div>
            {!formIsFlat && formSubCategories.length === 0 && (
              <div
                style={{
                  padding: '12px 14px',
                  background: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '8px',
                }}
              >
                <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#475569' }}>
                  Create a sub-category under <strong>{formMainCategory}</strong> to continue.
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <input
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="e.g. Machinery, Parts…"
                    style={{
                      flex: 1,
                      minWidth: '180px',
                      padding: '10px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={creatingCategory}
                    style={{
                      padding: '10px 16px',
                      background: '#111',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    {creatingCategory ? 'Creating…' : `Add under ${formMainCategory}`}
                  </button>
                </div>
              </div>
            )}
            {formIsFlat && (
              <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                Products are listed under {formMainCategory} with no sub-categories or dimensions.
              </p>
            )}
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
                fontSize: '16px',
                maxWidth: '280px',
              }}
              required 
            />
            <div>
              <label
                htmlFor="homeOrder"
                style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333' }}
              >
                Home page position
              </label>
              <select
                id="homeOrder"
                name="homeOrder"
                value={form.homeOrder}
                onChange={handleChange}
                style={{
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px',
                  maxWidth: '320px',
                  width: '100%',
                  background: '#fff',
                }}
              >
                <option value="">Not prioritized (won&apos;t be in top 3)</option>
                <option value="1">1st on home (this category)</option>
                <option value="2">2nd on home (this category)</option>
                <option value="3">3rd on home (this category)</option>
                <option value="4">4th (reserve / next in line)</option>
                <option value="5">5th</option>
              </select>
              <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#666', lineHeight: 1.45 }}>
                Home shows only 3 products per category. Set 1, 2, and 3 on the products you want featured.
                Lower number appears first.
              </p>
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
            {!formIsFlat && (
            <div style={{
              border: '1px solid #e5e5e5',
              borderRadius: '10px',
              padding: '14px',
              background: '#fafafa'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, color: '#222' }}>Dimensions</h4>
                <button
                  type="button"
                  onClick={() => addAttributeRow(setDimensionRows)}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #111',
                    borderRadius: '999px',
                    background: '#fff',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  + Add row
                </button>
              </div>
              <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#666' }}>
                Add custom sub-headings for this product (e.g. Width, Table Top Size, Seat Height).
                Or paste a full list below — one item per line — and click Fill rows.
              </p>
              <div style={{ marginBottom: '14px' }}>
                <label style={fieldLabelStyle} htmlFor="dimension-paste">Paste dimensions</label>
                <textarea
                  id="dimension-paste"
                  value={dimensionPaste}
                  onChange={(e) => setDimensionPaste(e.target.value)}
                  onPaste={(e) => {
                    const pasted = e.clipboardData?.getData('text') || '';
                    if (pasted.includes('\n') || /[:|\t]/.test(pasted)) {
                      e.preventDefault();
                      setDimensionPaste(pasted);
                      const parsed = parseAttributeBlock(pasted);
                      if (parsed.length) {
                        setDimensionRows(parsed);
                        setDimensionPaste('');
                      }
                    }
                  }}
                  placeholder={'Width: 60 cm\nHeight: 120 cm\nDepth: 40 cm'}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    marginBottom: '8px',
                  }}
                />
                <button
                  type="button"
                  onClick={() => applyAttributePaste(setDimensionRows, dimensionPaste, setDimensionPaste)}
                  style={{
                    padding: '8px 14px',
                    border: '1px solid #111',
                    borderRadius: '999px',
                    background: '#111',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  Fill rows from paste
                </button>
              </div>
              {dimensionRows.map((row, index) => (
                <div key={`dimension-${index}`} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={fieldLabelStyle} htmlFor={`dimension-label-${index}`}>Sub-heading</label>
                    <input
                      id={`dimension-label-${index}`}
                      placeholder="e.g. Width"
                      value={row.label}
                      onChange={(e) => handleAttributeRowChange(setDimensionRows, index, 'label', e.target.value)}
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
                    <label style={fieldLabelStyle} htmlFor={`dimension-value-${index}`}>Value</label>
                    <input
                      id={`dimension-value-${index}`}
                      placeholder="e.g. 60 cm"
                      value={row.value}
                      onChange={(e) => handleAttributeRowChange(setDimensionRows, index, 'value', e.target.value)}
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
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => removeAttributeRow(setDimensionRows, index)}
                      style={{
                        padding: '10px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        background: '#fff',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            )}
            <div style={{
              border: '1px solid #e5e5e5',
              borderRadius: '10px',
              padding: '14px',
              background: '#fafafa'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, color: '#222' }}>Specifications</h4>
                <button
                  type="button"
                  onClick={() => addAttributeRow(setSpecificationRows)}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #111',
                    borderRadius: '999px',
                    background: '#fff',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  + Add row
                </button>
              </div>
              <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#666' }}>
                Add custom sub-headings for this product (e.g. Material, Frame, Weight Capacity).
                Or paste a full list below — one item per line — and click Fill rows.
              </p>
              <div style={{ marginBottom: '14px' }}>
                <label style={fieldLabelStyle} htmlFor="specification-paste">Paste specifications</label>
                <textarea
                  id="specification-paste"
                  value={specificationPaste}
                  onChange={(e) => setSpecificationPaste(e.target.value)}
                  onPaste={(e) => {
                    const pasted = e.clipboardData?.getData('text') || '';
                    if (pasted.includes('\n') || /[:|\t]/.test(pasted)) {
                      e.preventDefault();
                      setSpecificationPaste(pasted);
                      const parsed = parseAttributeBlock(pasted);
                      if (parsed.length) {
                        setSpecificationRows(parsed);
                        setSpecificationPaste('');
                      }
                    }
                  }}
                  placeholder={'Material: Solid wood\nFrame: Powder-coated steel\nWeight Capacity: 120 kg'}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    marginBottom: '8px',
                  }}
                />
                <button
                  type="button"
                  onClick={() =>
                    applyAttributePaste(setSpecificationRows, specificationPaste, setSpecificationPaste)
                  }
                  style={{
                    padding: '8px 14px',
                    border: '1px solid #111',
                    borderRadius: '999px',
                    background: '#111',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  Fill rows from paste
                </button>
              </div>
              {specificationRows.map((row, index) => (
                <div key={`specification-${index}`} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={fieldLabelStyle} htmlFor={`specification-label-${index}`}>Sub-heading</label>
                    <input
                      id={`specification-label-${index}`}
                      placeholder="e.g. Material"
                      value={row.label}
                      onChange={(e) => handleAttributeRowChange(setSpecificationRows, index, 'label', e.target.value)}
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
                    <label style={fieldLabelStyle} htmlFor={`specification-value-${index}`}>Value</label>
                    <input
                      id={`specification-value-${index}`}
                      placeholder="e.g. Solid wood"
                      value={row.value}
                      onChange={(e) => handleAttributeRowChange(setSpecificationRows, index, 'value', e.target.value)}
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
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => removeAttributeRow(setSpecificationRows, index)}
                      style={{
                        padding: '10px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        background: '#fff',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <h3 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '1.1rem' }}>
                    {item.name}
                  </h3>
                  {item.homeOrder > 0 && (
                    <span
                      title="Home page position in this category"
                      style={{
                        flexShrink: 0,
                        background: '#111',
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                      }}
                    >
                      HOME #{item.homeOrder}
                    </span>
                  )}
                </div>
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
                    {typeof item.category === 'object' && isFlatMainCategory(item.category.mainCategory)
                      ? item.category.mainCategory
                      : (
                        <>
                          {typeof item.category === 'object' ? item.category.name : item.category}
                          {typeof item.category === 'object' && item.category.mainCategory && (
                            <span style={{ fontWeight: 400, color: '#777' }}> · {item.category.mainCategory}</span>
                          )}
                        </>
                      )}
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
                      const mainFromItem =
                        (typeof item.category === 'object' && item.category?.mainCategory) ||
                        'Consumer Products';
                      setEditingId(item._id);
                      setShowForm(true);
                      setBackgroundVideoFile(null);
                      setFormMainCategory(mainFromItem);
                      setNewCategoryMainCategory(mainFromItem);
                      setForm({
                        name: item.name || '',
                        series: item.series || '',
                        category: typeof item.category === 'object' ? item.category.name : item.category || '',
                        price: item.price || '',
                        description: item.description || '',
                        backgroundVideoUrl: item.backgroundVideoUrl || item.videoUrl || '',
                        homeOrder: item.homeOrder > 0 ? String(item.homeOrder) : '',
                      });
                      setDimensionRows(attributesToRows(item.dimensions));
                      setSpecificationRows(attributesToRows(item.specifications));
                      setDimensionPaste('');
                      setSpecificationPaste('');
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
        
        {listLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
            <p>Loading products...</p>
          </div>
        ) : listError ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
            <h3>Unable to load products</h3>
            <p>The API may still be starting. Please try again.</p>
            <button
              type="button"
              onClick={async () => {
                setListLoading(true);
                const ok = await fetchItems();
                await fetchCategories();
                if (!ok) setListError(true);
                setListLoading(false);
              }}
            >
              Try again
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
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
        ) : null}
      </div>
    </div>
  );
}
