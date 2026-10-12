const mongoose = require('mongoose');

const catalogueSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    pdfUrl: { type: String, required: true },
    filePath: { type: String, default: '' },
    publicId: { type: String, default: '' },
    resourceType: { type: String, default: 'raw' },
    coverUrl: { type: String, default: '' },
    coverPublicId: { type: String, default: '' },
    fileName: { type: String, default: '' },
    fileSize: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Catalogue', catalogueSchema);
