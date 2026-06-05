const express = require('express');
const { getServicePage } = require('../controllers/servicePage');

const router = express.Router();

router.get('/', getServicePage);

module.exports = router;
