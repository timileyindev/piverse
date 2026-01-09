const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    index: true
  },
  gameStateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameState',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 500
  },
  role: {
    type: String,
    enum: ['user', 'ai'],
    required: true
  },
  txSignature: {
    type: String,
    required: false // AI messages won't have this
  },
  isWinner: {
    type: Boolean,
    default: false
  },
  // Assessment of the attempt (for logs)
  aiAssessment: {
    type: String,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
