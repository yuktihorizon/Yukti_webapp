const express = require('express');
const multer = require('multer');
const { uploadToCloudinary } = require('../controllers/upload');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', upload.single('file'), uploadToCloudinary);

module.exports = router;
