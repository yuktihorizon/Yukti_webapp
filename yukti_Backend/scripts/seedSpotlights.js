/* Seed spotlight entries (upsert) */
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Spotlight = require('../models/Spotlight');

dotenv.config();

async function upsert(name, payload) {
  await Spotlight.updateOne({ name }, { $set: payload }, { upsert: true });
  console.log(`Upserted spotlight: ${name}`);
}

(async function run() {
  try {
    await connectDB();

    await upsert('The Guy With Rose', {
      imageUrl: 'https://res.cloudinary.com/dtfsvshn6/image/upload/v1748197838/spotlight/images/k0hhjhefo0nosvkravqd.jpg',
      mediaUrl: 'https://www.instagram.com/theguywithrose?igsh=YmhuNDEzcG9ya3Nj',
      description: 'Wholesome content throughout the page. Instagram spotlight.'
    });

    await upsert('Manik Mahana', {
      imageUrl: 'https://res.cloudinary.com/dtfsvshn6/image/upload/v1748197742/spotlight/images/idpct5pycai73xi6rbop.jpg',
      mediaUrl: 'https://youtu.be/vccwHvCIuW8?si=RaZRrQ8pASnG8BFI',
      description: 'One of the best stand‑up comedians. YouTube feature.'
    });

    console.log('Spotlight seeding complete.');
  } catch (err) {
    console.error('Spotlight seed failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
})();
