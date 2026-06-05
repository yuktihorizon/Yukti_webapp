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
  dimensions: {
    details: String,
    width: String,
    height: String,
    depth: String,
    seatHeight: String
  },
  specifications: {
    details: String,
    material: String,
    frame: String,
    padding: String,
    weightCapacity: String,
    assembly: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
