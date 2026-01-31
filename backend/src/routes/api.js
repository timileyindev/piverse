const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const chatController = require('../controllers/chatController');
const predictionController = require('../controllers/predictionController');

// Global Rate Limiter: 10 requests per second per IP (applies to all routes)
const globalLimiter = rateLimit({
        windowMs: 1000, 
        max: 20, 
        standardHeaders: true, 
        legacyHeaders: false, 
    message: { error: "Too many requests. Slow down!" },
    validate: { xForwardedForHeader: false }
});

// Chat Rate Limiter: 1 message per 3 seconds per wallet
const chatLimiter = rateLimit({
        windowMs: 3 * 1000, 
        max: 1, 
        standardHeaders: true, 
        legacyHeaders: false, 
    keyGenerator: (req) => req.body.walletAddress || 'anonymous',
    message: { error: "Message rate limit. Wait 3 seconds between messages." },
    validate: { xForwardedForHeader: false }
});

// Apply global limiter to all routes
router.use(globalLimiter);

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
