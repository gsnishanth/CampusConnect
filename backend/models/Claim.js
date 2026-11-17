const mongoose = require('mongoose');

const ClaimSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    claimantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    answers: [
      {
        question: { type: String },
        answer: { type: String },
      },
    ],
    verificationScore: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'disputed'],
      default: 'pending',
    },
    decisionNote: {
      type: String,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate claims
ClaimSchema.index({ itemId: 1, claimantId: 1 });

module.exports = mongoose.model('Claim', ClaimSchema);
