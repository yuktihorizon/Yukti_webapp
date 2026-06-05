const express = require('express');
const multer = require('multer');
const { createProduct, getProducts, getProductById } = require('../controllers/product');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });


router.post('/createproducts', upload.fields([{ name: 'images', maxCount: 5 }]), createProduct);
router.get('/getproducts', getProducts);
router.get('/getproducts/:id', getProductById);

module.exports = router;
