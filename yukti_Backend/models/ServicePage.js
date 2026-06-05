const mongoose = require('mongoose');

const heroWordSchema = new mongoose.Schema(
  {
    text: String,
    layoutClass: String,
  },
  { _id: false }
);

const capabilityImageSchema = new mongoose.Schema(
  {
    src: String,
    alt: String,
  },
  { _id: false }
);

const capabilityBlockSchema = new mongoose.Schema(
  {
    id: String,
    theme: { type: String, enum: ['dark', 'light'], default: 'light' },
    number: String,
    label: String,
    headingLines: [String],
    paragraphs: [String],
    images: [capabilityImageSchema],
  },
  { _id: false }
);

const formFieldSchema = new mongoose.Schema(
  {
    name: String,
    label: String,
    type: String,
    placeholder: String,
    required: Boolean,
    row: { type: String, enum: ['top', 'full'], default: 'full' },
  },
  { _id: false }
);

const servicePageSchema = new mongoose.Schema(
  {
    pageKey: { type: String, required: true, unique: true, default: 'main' },
    hero: {
      backgroundImage: String,
      overlayOpacity: Number,
      words: [heroWordSchema],
    },
    capabilitiesIntro: {
      titleLines: [String],
      paragraphs: [String],
    },
    capabilityBlocks: [capabilityBlockSchema],
    projectForm: {
      backgroundImage: String,
      overlayOpacity: Number,
      titleLines: [String],
      subtitle: String,
      submitLabel: String,
      successToast: String,
      errorToast: String,
      fields: [formFieldSchema],
      apiMap: {
        firstNameKey: String,
        emailKey: String,
        subjectKey: String,
        messagePattern: String,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ServicePage', servicePageSchema);
