const mongoose = require('mongoose');

const GameStateSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    default: () => "session_" + Date.now()
  },
  name: {
    type: String,
    default: "PI VERSE"
  },
  gameId: {
    type: String,
    required: true,
    unique: true
  },
  pda: {
    type: String, // The PDA for the on-chain GameState account
    default: null
  },
  jackpot: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  },
  keyHolder: {
    type: String,
    default: null
  },
  totalAttempts: {
    type: Number,
    default: 0
  },
  minAttemptsBeforeYield: {
    type: Number,
    default: 500
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  resolveTxSignature: {
    type: String,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('GameState', GameStateSchema);
