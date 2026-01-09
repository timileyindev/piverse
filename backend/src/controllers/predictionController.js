const GameState = require('../models/GameState');
const Prediction = require('../models/Prediction');
const { verifyTransaction } = require('../services/solana');

// Calculate dynamic multipliers based on pool balance (Simplified AMM logic)
const calculateMultipliers = async (gameStateId) => {
    // 1. Get totals for this session
    const predictions = await Prediction.find({ gameStateId, status: 'pending' });
    
    let poolFail = predictions.filter(p => p.type === 'fail').reduce((acc, p) => acc + p.amount, 0);
    let poolBreach = predictions.filter(p => p.type === 'breach').reduce((acc, p) => acc + p.amount, 0);

    // Initial seeding to prevent division by zero
    poolFail = Math.max(poolFail, 100); 
    poolBreach = Math.max(poolBreach, 100);

    // Inverse ratio: If everyone bets 'fail', 'breach' payout skyrockets
    const totalPool = poolFail + poolBreach;
    
    // Multiplier = Total Pool / Side Pool (minus fees in real scenario)
    const failMultiplier = parseFloat((totalPool / poolFail).toFixed(2));
    const breachMultiplier = parseFloat((totalPool / poolBreach).toFixed(2));

    return { failMultiplier, breachMultiplier, poolFail, poolBreach };
};

exports.placePrediction = async (req, res) => {
    const { walletAddress, type, amount, txSignature } = req.body;
    const io = req.app.get('io');
    
    try {
        // 0. Verify Payment
        const isPaymentValid = await verifyTransaction(txSignature, walletAddress, Number(amount));
        if (!isPaymentValid) {
            return res.status(402).json({ error: 'Payment verification failed' });
        }

        // 1. Get Active Game
        const gameState = await GameState.findOne({ status: 'active' });
        if (!gameState) return res.status(404).json({ error: 'No active game session' });

        // 2. Get Current Multipliers (Lock it in for this bet)
        const { failMultiplier, breachMultiplier } = await calculateMultipliers(gameState._id);
        const lockedMultiplier = type === 'fail' ? failMultiplier : breachMultiplier;

        // 3. Save Prediction
        const prediction = new Prediction({
            gameStateId: gameState._id,
            walletAddress,
            type,
            amount,
            payoutMultiplier: lockedMultiplier
        });
        await prediction.save();

        // 4. emit 'new_market_event'
        io.emit('new_market_event', {
            type: 'bet',
            walletAddress,
            betType: type, // 'fail' or 'breach'
            amount,
            timestamp: new Date()
        });

        // 5. Emit Updated Market Stats (re-calculate with new bet included)
        const newStats = await calculateMultipliers(gameState._id);
        io.emit('market_stats_update', newStats);

        res.json({ success: true, prediction });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.getMarketStats = async (req, res) => {
    try {
        const gameState = await GameState.findOne({ status: 'active' });
        if (!gameState) return res.status(200).json({ failMultiplier: 1.0, breachMultiplier: 1.0, poolFail: 0, poolBreach: 0 }); // Idle state

        const stats = await calculateMultipliers(gameState._id);
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getUserPredictions = async (req, res) => {
    const { walletAddress } = req.params;
    try {
         const predictions = await Prediction.find({ walletAddress }).sort({ createdAt: -1 }).limit(20);
         res.json(predictions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
