const jwt = require('jsonwebtoken');

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'dev-secret';

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      return res.status(500).json({ error: 'Admin credentials not configured' });
    }

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = jwt.sign({ role: 'admin', email }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token });
    }

    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (e) {
    return res.status(500).json({ error: 'Login failed' });
  }
};
