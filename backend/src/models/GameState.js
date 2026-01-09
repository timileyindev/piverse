const mongoose = require('mongoose');

const GameStateSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true, // e.g. "session_1"
    default: () => "session_" + Date.now()
  },
  jackpot: {
    type: Number,
    default: 1000, 
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  },
  keyHolder: {
    type: String, // Wallet address of the winner
    default: null
  },
  totalAttempts: {
    type: Number,
    default: 0
  },
  minAttemptsBeforeYield: {
    type: Number,
    default: 500 // AI will forcefully reject everything before this
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('GameState', GameStateSchema);
