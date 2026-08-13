const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  series: String,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', 
    required: true
  },
  description: String,
  price: Number,
  colors: [String],
  images: [String], 
  thumbnails: [String],
  videoUrl: String,
  /** Full-page product detail background: YouTube URL or direct video URL (e.g. Cloudinary). */
  backgroundVideoUrl: String,
  /** Flexible label/value pairs — each product can define its own sub-headings. */
  dimensions: [{
    label: String,
    value: String
  }],
  specifications: [{
    label: String,
    value: String
  }],
  /**
   * Home page priority within a category (1 = first, 2 = second, …).
   * Only the first 3 products (by this order) are shown on the home slider.
   * 0 / unset = not prioritized (shown after numbered products).
   */
  homeOrder: {
    type: Number,
    default: 0,
    min: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
