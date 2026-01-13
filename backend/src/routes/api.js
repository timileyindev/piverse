const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const chatController = require('../controllers/chatController');
const predictionController = require('../controllers/predictionController');

// Rate Limiter: 1 request every 3 seconds per wallet/IP
const chatLimiter = rateLimit({
	windowMs: 3 * 1000, 
	max: 1, 
	standardHeaders: true, 
	legacyHeaders: false, 
    keyGenerator: (req) => {
        return req.body.walletAddress || req.ip; 
    },
    message: { error: "Whoa strict! Rate limit exceeded. Wait 3s." }
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
