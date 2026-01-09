const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
  gameStateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameState',
    required: true,
    index: true
  },
  walletAddress: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['fail', 'breach'], // 'fail' = user fails, 'breach' = user wins
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'won', 'lost'],
    default: 'pending'
  },
  payoutMultiplier: {
    type: Number,
    required: true // Snapshot of multiplier at time of bet
  }
}, { timestamps: true });

module.exports = mongoose.model('Prediction', PredictionSchema);
