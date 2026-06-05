const express = require('express');
const router = express.Router();
const { getContactMessages, createContactMessage } = require('../controllers/contact');

router.get('/getmessages', getContactMessages);
router.post('/createmessages', createContactMessage);

module.exports = router;
