const express = require('express');
const { getBlogs } = require('../controllers/blog');

const router = express.Router();

router.get('/', getBlogs);

module.exports = router;
