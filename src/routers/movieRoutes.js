const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

// Defining routes for each sort criteria
router.get('/popularity', movieController.searchMovies); // For sorting by popularity
router.get('/release-date', movieController.searchMovies); // For sorting by release date
router.get('/vote', movieController.searchMovies); // For sorting by votes
router.get('/id/:id', movieController.getMovieById); // For getting movie details by ID
router.get('/meta', movieController.getMetadata); // For fetching metadata

module.exports = router;
