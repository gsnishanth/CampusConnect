const mongoose = require('mongoose');

const VerificationDetailSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
      unique: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    identifyingMarks: {
      type: String,
    },
    hiddenDetails: {
      type: String,
    },
    additionalQuestions: [
      {
        question: { type: String },
        answer: { type: String },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('VerificationDetail', VerificationDetailSchema);
