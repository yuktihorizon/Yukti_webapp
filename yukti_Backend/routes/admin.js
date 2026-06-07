const express = require('express');
const multer = require('multer');
const { adminLogin } = require('../controllers/adminAuth');
const { createSpotlight, deleteSpotlight } = require('../controllers/spotlight');
const { createProduct, deleteProduct, updateProduct } = require('../controllers/product');
const { getContactMessages } = require('../controllers/contact');
const { getAllOrders } = require('../controllers/order');
const {
  getServicePageAdmin,
  updateServicePage,
} = require('../controllers/servicePage');
const { createBlog, updateBlog, deleteBlog } = require('../controllers/blog');
const requireAdmin = require('../middlewares/requireAdmin');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Admin Auth
router.post('/login', adminLogin);

// Protected Admin Routes
router.post('/spotlight', requireAdmin, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'media', maxCount: 1 }]), createSpotlight);
router.delete('/spotlight/:id', requireAdmin, deleteSpotlight);

const productUpload = upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'backgroundVideo', maxCount: 1 },
]);
router.post('/products', requireAdmin, productUpload, createProduct);
router.put('/products/:id', requireAdmin, productUpload, updateProduct);
router.delete('/products/:id', requireAdmin, deleteProduct);

router.get('/contacts', requireAdmin, getContactMessages);
router.get('/orders', requireAdmin, getAllOrders);

router.get('/service-page', requireAdmin, getServicePageAdmin);
router.put('/service-page', requireAdmin, updateServicePage);

const blogUpload = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'file', maxCount: 3 },
  { name: 'images', maxCount: 40 },
  { name: 'slides', maxCount: 60 },
]);
router.post('/blog', requireAdmin, blogUpload, createBlog);
router.put('/blog/:id', requireAdmin, blogUpload, updateBlog);
router.delete('/blog/:id', requireAdmin, deleteBlog);

module.exports = router;
