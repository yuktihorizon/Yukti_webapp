const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const Category = require('../models/Category');

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

const normalizeAttributeField = (data) => {
  if (!data) return [];

  let parsed = data;
  if (typeof data === 'string') {
    const trimmed = data.trim();
    if (!trimmed) return [];
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      return [{ label: 'Details', value: trimmed }];
    }
  }

  if (Array.isArray(parsed)) {
    return parsed
      .map((item) => ({
        label: String(item?.label || '').trim(),
        value: String(item?.value || '').trim(),
      }))
      .filter((item) => item.label && item.value);
  }

  if (typeof parsed === 'object') {
    return Object.entries(parsed)
      .filter(([key, val]) => key.toLowerCase() !== 'details' && val != null && String(val).trim())
      .map(([key, val]) => ({
        label: LEGACY_LABELS[key] || formatLegacyKey(key),
        value: String(val).trim(),
      }));
  }

  return [];
};

const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'image', folder },
      (error, result) => {
        if (result) resolve(result.secure_url);
        else reject(error);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

const uploadVideoToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'video', folder },
      (error, result) => {
        if (result) resolve(result.secure_url);
        else reject(error);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

exports.createProduct = async (req, res) => {
  try {
    const {
      name, series, description, category, price,
      colors, videoUrl, backgroundVideoUrl, dimensions, specifications, homeOrder,
    } = req.body;

    const foundCategory = await Category.findOne({ name: category.trim() });
    if (!foundCategory) {
      return res.status(400).json({ error: `Category '${category}' not found` });
    }

    const images = [];
    if (req.files && req.files.images) {
      for (const file of req.files.images) {
        const url = await uploadToCloudinary(file.buffer, 'products');
        images.push(url);
      }
    }

    // Safe parsing helpers so admin panel can send either
    // JSON strings or plain text for structured fields.
    let parsedColors = [];
    let parsedDimensions = {};
    let parsedSpecifications = {};

    try {
      parsedColors = colors ? JSON.parse(colors) : [];
    } catch {
      parsedColors = [];
    }

    try {
      parsedDimensions = normalizeAttributeField(dimensions);
    } catch {
      parsedDimensions = [];
    }

    try {
      parsedSpecifications = normalizeAttributeField(specifications);
    } catch {
      parsedSpecifications = [];
    }

    let resolvedBackgroundVideoUrl =
      typeof backgroundVideoUrl === 'string' ? backgroundVideoUrl.trim() : '';
    const bgFile = req.files && req.files.backgroundVideo && req.files.backgroundVideo[0];
    if (bgFile && bgFile.buffer) {
      resolvedBackgroundVideoUrl = await uploadVideoToCloudinary(bgFile.buffer, 'products/videos');
    }

    const parsedHomeOrder = Number.parseInt(homeOrder, 10);
    const newProduct = new Product({
      name,
      series,
      description,
      category: foundCategory._id,
      price,
      colors: parsedColors,
      videoUrl,
      backgroundVideoUrl: resolvedBackgroundVideoUrl || undefined,
      dimensions: parsedDimensions,
      specifications: parsedSpecifications,
      images,
      homeOrder: Number.isFinite(parsedHomeOrder) && parsedHomeOrder > 0 ? parsedHomeOrder : 0,
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { category, mainCategory, limit } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    } else if (mainCategory) {
      const matchingCategories = await Category.find({ mainCategory: mainCategory.trim() }).select('_id');
      query.category = { $in: matchingCategories.map((c) => c._id) };
    }

    const products = await Product.find(query).limit(parseInt(limit) || 0).populate('category');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      series,
      description,
      category,
      price,
      colors,
      videoUrl,
      backgroundVideoUrl,
      dimensions,
      specifications,
      homeOrder,
      imagesOrder,
    } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (category) {
      const foundCategory = await Category.findOne({ name: category.trim() });
      if (!foundCategory) {
        return res.status(400).json({ error: `Category '${category}' not found` });
      }
      product.category = foundCategory._id;
    }

    if (typeof name === 'string') product.name = name;
    if (typeof series === 'string') product.series = series;
    if (typeof description === 'string') product.description = description;
    if (typeof price !== 'undefined') product.price = price;
    if (typeof videoUrl === 'string') product.videoUrl = videoUrl;
    if (typeof homeOrder !== 'undefined') {
      const parsedHomeOrder = Number.parseInt(homeOrder, 10);
      product.homeOrder = Number.isFinite(parsedHomeOrder) && parsedHomeOrder > 0 ? parsedHomeOrder : 0;
    }

    const bgFile = req.files && req.files.backgroundVideo && req.files.backgroundVideo[0];
    if (bgFile && bgFile.buffer) {
      product.backgroundVideoUrl = await uploadVideoToCloudinary(bgFile.buffer, 'products/videos');
    } else if (typeof backgroundVideoUrl === 'string') {
      product.backgroundVideoUrl = backgroundVideoUrl.trim();
    }

    // colors
    if (colors) {
      try {
        product.colors = JSON.parse(colors);
      } catch {
        product.colors = [];
      }
    }

    // dimensions
    if (typeof dimensions !== 'undefined') {
      try {
        product.dimensions = normalizeAttributeField(dimensions);
      } catch {
        product.dimensions = [];
      }
    }

    // specifications
    if (typeof specifications !== 'undefined') {
      try {
        product.specifications = normalizeAttributeField(specifications);
      } catch {
        product.specifications = [];
      }
    }
    if (imagesOrder) product.images = JSON.parse(imagesOrder);

    if (req.files && req.files.images) {
      for (const file of req.files.images) {
        const url = await uploadToCloudinary(file.buffer, 'products');
        product.images.push(url);
      }
    }

    await product.save();
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product' });
  }
};
