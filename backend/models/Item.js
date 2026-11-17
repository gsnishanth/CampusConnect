const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    type: {
      type: String,
      enum: ['lost', 'found'],
      required: [true, 'Item type is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'Electronics',
        'Wallets & Accessories',
        'Books & Stationery',
        'ID Cards',
        'Clothing',
        'Keys',
        'Bags',
        'Other',
      ],
      required: [true, 'Category is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    approximateTime: {
      type: String,
    },
    image: {
      type: String,
    },
    status: {
      type: String,
      enum: ['active', 'matched', 'returned', 'closed'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// Indexes
ItemSchema.index({ type: 1 });
ItemSchema.index({ category: 1 });
ItemSchema.index({ status: 1 });
ItemSchema.index({ userId: 1 });
ItemSchema.index({ location: 'text' });

module.exports = mongoose.model('Item', ItemSchema);
