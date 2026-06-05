const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: {
    type: String,
    enum: ['Images', 'Articles', 'Presentations'],
    required: true,
  },
  image: { type: String, required: true },
  // Articles
  content: [{ type: String }],
  // Images
  shortTitle: { type: String, default: '' },
  detailTitle: { type: String, default: '' },
  images: [{ type: String }],
  // Presentations
  coverText: { type: String, default: '' },
  slides: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Blog', blogSchema);
