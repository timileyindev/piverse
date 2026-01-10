const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const predictionController = require('../controllers/predictionController');

// Chat & Game Routes
router.post('/chat', chatController.handleChat);
router.get('/feed', chatController.getFeed);
router.get('/stats', chatController.getStats);

// Admin Routes
router.post('/admin/register-game', chatController.registerGame);

// Prediction Market Routes
router.post('/predict', predictionController.placePrediction);
router.get('/market', predictionController.getMarketStats);
router.get('/predictions/:walletAddress', predictionController.getUserPredictions);

module.exports = router;
