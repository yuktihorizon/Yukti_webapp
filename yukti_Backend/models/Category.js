const mongoose = require('mongoose');
const { MAIN_CATEGORIES } = require('../constants/mainCategories');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  mainCategory: {
    type: String,
    enum: MAIN_CATEGORIES,
    default: 'Consumer Products',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
