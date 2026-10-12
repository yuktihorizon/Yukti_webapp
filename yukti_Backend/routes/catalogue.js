const express = require('express');
const { getPublishedCatalogues, streamCataloguePdf } = require('../controllers/catalogue');

const router = express.Router();

router.get('/', getPublishedCatalogues);
router.get('/:id/file', streamCataloguePdf);

module.exports = router;
