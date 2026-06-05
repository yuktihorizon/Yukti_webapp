const mongoose = require('mongoose');

const spotlightSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  mediaUrl: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Spotlight', spotlightSchema);
