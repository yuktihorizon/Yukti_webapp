const express = require('express');
const multer = require('multer');
const { getSpotlights, createSpotlight, deleteSpotlight } = require('../controllers/spotlight');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/getSpotlight', getSpotlights);
router.post('/createSpotlight',upload.fields([{ name: 'image', maxCount: 1 },{ name: 'media', maxCount: 1 }]),createSpotlight);
router.delete('/spotlight/:id', deleteSpotlight);

module.exports = router;
