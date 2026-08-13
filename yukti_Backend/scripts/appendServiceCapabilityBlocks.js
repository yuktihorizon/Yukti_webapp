/**
 * Appends capability sections 03–05 to the service page if they are missing.
 * Run: node scripts/appendServiceCapabilityBlocks.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const ServicePage = require('../models/ServicePage');
const { defaultServicePageDocument } = require('../utils/servicePageDefaults');

const NEW_BLOCK_IDS = ['digital-products'];

async function run() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGO_URI or MONGODB_URI not set in .env');
    process.exit(1);
  }

  await mongoose.connect(uri);

  const defaults = defaultServicePageDocument.capabilityBlocks;
  const toAppend = defaults.filter((block) => NEW_BLOCK_IDS.includes(block.id));

  let doc = await ServicePage.findOne({ pageKey: 'main' });
  if (!doc) {
    doc = await ServicePage.create(defaultServicePageDocument);
    console.log('Created service page with all capability blocks.');
    await mongoose.disconnect();
    return;
  }

  const existingIds = new Set((doc.capabilityBlocks || []).map((b) => b.id));
  const missing = toAppend.filter((block) => !existingIds.has(block.id));

  if (missing.length === 0) {
    console.log('All three additional capability sections already exist.');
    await mongoose.disconnect();
    return;
  }

  const nextNumber = String((doc.capabilityBlocks?.length || 0) + 1).padStart(2, '0');
  const numbered = missing.map((block, i) => ({
    ...block,
    number: String(parseInt(nextNumber, 10) + i).padStart(2, '0'),
  }));

  doc.capabilityBlocks = [...(doc.capabilityBlocks || []), ...numbered];
  await doc.save();

  console.log(`Added ${numbered.length} capability section(s):`);
  numbered.forEach((b) => console.log(`  - ${b.number} ${b.label}`));

  await mongoose.disconnect();
  console.log('Done.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
