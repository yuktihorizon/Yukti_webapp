const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { isDbReady } = require('./config/db');
const requireDb = require('./middlewares/requireDb');
const errorHandler = require('./middlewares/errorHandler');

dotenv.config();

const startServer = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Failed to connect to MongoDB on startup:', err.message);
    process.exit(1);
  }

  const app = express();
  app.set('trust proxy', 1);

  // Comma-separated FRONTEND_URL values, e.g. http://localhost:5173,http://localhost:5175
  const allowedOrigins = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .concat(['https://yuktihorizon.in', 'https://www.yuktihorizon.in']);

  const isLocalDevOrigin = (origin) =>
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || '');

  app.use(
    cors({
      credentials: true,
      origin(origin, callback) {
        if (!origin) {
          return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        if (process.env.NODE_ENV !== 'production' && isLocalDevOrigin(origin)) {
          return callback(null, true);
        }
        return callback(null, false);
      },
    })
  );
  app.use(express.json({ limit: '2mb' }));

  app.use((req, res, next) => {
    if (req.method === 'GET' && req.path.startsWith('/api')) {
      res.set('Cache-Control', 'no-store');
    }
    next();
  });

  app.get('/', (req, res) => {
    res.send('API is running...');
  });

  app.get('/health', (req, res) => {
    const dbReady = isDbReady();
    res.status(dbReady ? 200 : 503).json({
      ok: dbReady,
      db: dbReady ? 'connected' : 'disconnected',
    });
  });

  app.use('/api', requireDb);

  const setupRoutes = require('./routes');
  setupRoutes(app);

  app.use(errorHandler);

  const PORT = process.env.PORT || 5050;
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;

  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled promise rejection:', reason);
  });

  process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
  });
};

startServer();
