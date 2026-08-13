const { isDbReady } = require('../config/db');

module.exports = function requireDb(req, res, next) {
  if (!isDbReady()) {
    return res.status(503).json({ error: 'Database unavailable, please retry' });
  }
  next();
};
