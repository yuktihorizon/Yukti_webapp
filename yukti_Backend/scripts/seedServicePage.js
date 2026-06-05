/**
 * Upserts the main Service page document (same defaults as utils/servicePageDefaults).
 * Run: node scripts/seedServicePage.js
 */
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const ServicePage = require('../models/ServicePage');
const { defaultServicePageDocument } = require('../utils/servicePageDefaults');

dotenv.config();

(async function run() {
  try {
    await connectDB();
    await ServicePage.findOneAndUpdate(
      { pageKey: 'main' },
      { $set: defaultServicePageDocument },
      { upsert: true, new: true }
    );
    console.log('Service page seeded (pageKey: main).');
  } catch (err) {
    console.error('seedServicePage failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
})();
