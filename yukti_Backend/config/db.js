const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

mongoose.set('strictQuery', true);

let listenersBound = false;

const bindConnectionListeners = () => {
  if (listenersBound) return;
  listenersBound = true;

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected — mongoose will try to reconnect');
  });
  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected');
  });
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err.message);
  });
};

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not set');
  }

  bindConnectionListeners();

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 10,
  });
  console.log('MongoDB connected');
};

const isDbReady = () => mongoose.connection.readyState === 1;

module.exports = connectDB;
module.exports.isDbReady = isDbReady;
