const product = require('./product');
const cart = require('./cart');
const order = require('./order');
const payment = require('./payment');
const contact = require('./contact');
const spotlight = require('./spotlight');
const upload = require('./upload');
const category = require('./category');
const location = require('./location');
const admin = require('./admin');
const servicePage = require('./servicePage');
const blog = require('./blog');

const setupRoutes = (app) => {
  app.use('/api/products', product);
  app.use('/api/cart', cart);
  app.use('/api/orders', order);
  app.use('/api/payment', payment);
  app.use('/api/contact', contact);
  app.use('/api/spotlight', spotlight);
  app.use('/api/upload', upload);
  app.use('/api/category', category);
  app.use('/api/location', location);
  app.use('/api/admin', admin);
  app.use('/api/service-page', servicePage);
  app.use('/api/blog', blog);
};

module.exports = setupRoutes;
