const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const chatController = require('../controllers/chatController');
const predictionController = require('../controllers/predictionController');

// Rate Limiter: 5 requests per 10 seconds per wallet/IP
const chatLimiter = rateLimit({
	windowMs: 10 * 1000, 
	max: 5, 
	standardHeaders: true, 
	legacyHeaders: false, 
    keyGenerator: (req) => {
        return req.body.walletAddress || req.ip; 
    },
    message: { error: "Slow down! Rate limit exceeded. Try again in a few seconds." }
});

// Chat & Game Routes
router.post('/chat', chatLimiter, chatController.handleChat);
router.get('/feed', chatController.getFeed);
router.get('/stats', chatController.getStats);

// Admin Routes
router.post('/admin/register-game', chatController.registerGame);

// Prediction Market Routes
router.post('/predict', predictionController.placePrediction);
router.get('/market', predictionController.getMarketStats);
router.get('/predictions/:walletAddress', predictionController.getUserPredictions);

module.exports = router;
