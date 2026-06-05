/* Seed 'Service' category and example service products */
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Category = require('../models/Category');
const Product = require('../models/Product');

dotenv.config();

async function ensureServiceCategory() {
  const name = 'Service';
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  let category = await Category.findOne({ slug });
  if (!category) {
    category = await Category.create({ name, slug });
    console.log(`Created category: ${name}`);
  } else {
    console.log(`Category already exists: ${name}`);
  }
  return category;
}

async function upsertServiceProducts(categoryId) {
  const serviceProducts = [
    {
      name: 'Lathe & Fabrication',
      series: 'Custom Work',
      description: 'Precision lathe, prototyping, and implementation. Request a quote for tailored solutions.',
      images: ['https://via.placeholder.com/900x600?text=Service+Lathe'],
    },
    {
      name: 'Material Consultation',
      series: 'Built For You',
      description: 'Expert guidance to choose materials and finishes that match your space and budget.',
      images: ['https://via.placeholder.com/900x600?text=Service+Consultation'],
    },
    {
      name: 'Installation & Assembly',
      series: 'End‑to‑End',
      description: 'Professional onsite setup and assembly for a flawless start-to-finish experience.',
      images: ['https://via.placeholder.com/900x600?text=Service+Installation'],
    },
  ];

  for (const data of serviceProducts) {
    const existing = await Product.findOne({ name: data.name, category: categoryId });
    if (existing) {
      console.log(`Product exists: ${data.name}`);
      continue;
    }
    await Product.create({
      name: data.name,
      series: data.series,
      description: data.description,
      category: categoryId,
      price: 0,
      colors: [],
      images: data.images,
      thumbnails: data.images,
      videoUrl: '',
      dimensions: {},
      specifications: {},
    });
    console.log(`Created product: ${data.name}`);
  }
}

(async function run() {
  try {
    await connectDB();
    const category = await ensureServiceCategory();
    await upsertServiceProducts(category._id);
    console.log('Seeding complete.');
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
})();
