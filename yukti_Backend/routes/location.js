const express = require('express');
const { getStates, getCitiesByState, getAllLocations } = require('../controllers/location');

const router = express.Router();

// Get all states
router.get('/states', getStates);

// Get cities by state
router.get('/cities/:state', getCitiesByState);

// Get all states and cities
router.get('/all', getAllLocations);

module.exports = router;
