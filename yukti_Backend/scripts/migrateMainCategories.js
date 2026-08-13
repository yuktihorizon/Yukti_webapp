/**
 * One-time migration: assign all existing categories without mainCategory
 * to "Consumer Products".
 *
 * Usage: node scripts/migrateMainCategories.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');

async function migrate() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGO_URI or MONGODB_URI not set in .env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const result = await Category.updateMany(
    { $or: [{ mainCategory: { $exists: false } }, { mainCategory: null }, { mainCategory: '' }] },
    { $set: { mainCategory: 'Consumer Products' } }
  );

  console.log(`Updated ${result.modifiedCount} categories to "Consumer Products"`);

  const all = await Category.find().select('name mainCategory');
  console.log('Current categories:');
  all.forEach((cat) => console.log(`  - ${cat.name} → ${cat.mainCategory}`));

  await mongoose.disconnect();
  console.log('Done.');
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
