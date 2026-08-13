const express = require('express');
const { createCategory, getCategories, getMainCategories } = require('../controllers/category');
const requireAdmin = require('../middlewares/requireAdmin');

const router = express.Router();

router.post('/createcategories', requireAdmin, createCategory);
router.get('/getcategories', getCategories);
router.get('/getmaincategories', getMainCategories);

module.exports = router;
