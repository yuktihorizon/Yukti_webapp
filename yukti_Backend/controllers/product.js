const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const Category = require('../models/Category');

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

exports.createProduct = async (req, res) => {
  try {
    const {
      name, series, description, category, price,
      colors, videoUrl, dimensions, specifications
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
      // allow plain text as a simple "details" field
      parsedDimensions = dimensions
        ? typeof dimensions === 'string' && !dimensions.trim().startsWith('{')
          ? { details: dimensions }
          : JSON.parse(dimensions)
        : {};
    } catch {
      parsedDimensions = {};
    }

    try {
      parsedSpecifications = specifications
        ? typeof specifications === 'string' && !specifications.trim().startsWith('{')
          ? { details: specifications }
          : JSON.parse(specifications)
        : {};
    } catch {
      parsedSpecifications = {};
    }

    const newProduct = new Product({
      name,
      series,
      description,
      category: foundCategory._id,
      price,
      colors: parsedColors,
      videoUrl,
      dimensions: parsedDimensions,
      specifications: parsedSpecifications,
      images
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
    const { category, limit } = req.query;
    const query = category ? { category } : {};
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
      dimensions,
      specifications,
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
        product.dimensions =
          typeof dimensions === 'string' && !dimensions.trim().startsWith('{')
            ? { details: dimensions }
            : JSON.parse(dimensions);
      } catch {
        product.dimensions = {};
      }
    }

    // specifications
    if (typeof specifications !== 'undefined') {
      try {
        product.specifications =
          typeof specifications === 'string' && !specifications.trim().startsWith('{')
            ? { details: specifications }
            : JSON.parse(specifications);
      } catch {
        product.specifications = {};
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
