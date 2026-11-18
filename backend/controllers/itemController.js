const Item = require('../models/Item');
const Claim = require('../models/Claim');
const VerificationDetail = require('../models/VerificationDetail');
const Notification = require('../models/Notification');
const fs = require('fs/promises');
const path = require('path');
const { findMatches } = require('../services/matchingService');
const { createNotification } = require('../services/notificationService');
const { success, error } = require('../utils/apiResponse');
const { uploadToCloudinary } = require('../middleware/uploadMiddleware');

/**
 * @route   GET /api/items
 * @access  Public
 */
const getItems = async (req, res, next) => {
  try {
    const {
      type,
      category,
      location,
      dateFrom,
      dateTo,
      status,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (status) {
      filter.status = status;
    } else {
      filter.status = 'active';
    }

    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Item.countDocuments(filter);
    const items = await Item.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('userId', 'name email');

    return success(res, {
      items,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/items
 * @access  Protected
 */
const createItem = async (req, res, next) => {
  try {
    const {
      type,
      title,
      category,
      description,
      location,
      date,
      approximateTime,
      verificationDetails,
    } = req.body;

    let imageUrl;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, 'campusconnect/items', req.file.mimetype);
    }

    const item = await Item.create({
      userId: req.user._id,
      type,
      title,
      category,
      description,
      location,
      date,
      approximateTime,
      image: imageUrl,
    });

    // If type is 'found', save verification details
    if (type === 'found' && verificationDetails) {
      let vd = verificationDetails;
      if (typeof vd === 'string') {
        try { vd = JSON.parse(vd); } catch (e) { vd = {}; }
      }
      await VerificationDetail.create({
        itemId: item._id,
        brand: vd.brand,
        identifyingMarks: vd.identifyingMarks,
        hiddenDetails: vd.hiddenDetails,
        additionalQuestions: vd.additionalQuestions || [],
      });
    }

    // Run matching and notify
    try {
      const matches = await findMatches(item);
      for (const match of matches) {
        // Notify owner of matched item
        await createNotification(
          match.matchedItem.userId,
          'Potential Match Found!',
          `A potential match was found for your ${match.matchedItem.type} item "${match.matchedItem.title}" (${match.score}% match).`,
          'match',
          match.matchedItem._id
        );
        // Notify the reporter of the new item
        await createNotification(
          req.user._id,
          'Potential Match Found!',
          `Your reported ${type} item "${title}" has a potential match (${match.score}% score).`,
          'match',
          item._id
        );
      }
    } catch (matchErr) {
      console.error('Matching error (non-fatal):', matchErr.message);
    }

    return success(res, { item }, 'Item reported successfully', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/items/:id
 * @access  Public
 */
const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).populate('userId', 'name email');
    if (!item) {
      return error(res, 'Item not found', 404);
    }
    let verificationQuestions = [];
    if (item.type === 'found') {
      const verification = await VerificationDetail.findOne({ itemId: item._id }).select('additionalQuestions');
      verificationQuestions = (verification?.additionalQuestions || []).map((question) => question.question);
    }
    const publicItem = item.toObject();
    publicItem.userId = publicItem.userId
      ? { _id: publicItem.userId._id, name: publicItem.userId.name }
      : publicItem.userId;
    return success(res, { item: { ...publicItem, verificationQuestions } });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PUT /api/items/:id
 * @access  Protected (owner or admin)
 */
const updateItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return error(res, 'Item not found', 404);
    }

    const isOwner = item.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return error(res, 'Not authorized to update this item', 403);
    }

    const {
      title,
      category,
      description,
      location,
      date,
      approximateTime,
      status,
      verificationDetails,
    } = req.body;

    let imageUrl = item.image;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, 'campusconnect/items', req.file.mimetype);
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      {
        title: title || item.title,
        category: category || item.category,
        description: description || item.description,
        location: location || item.location,
        date: date || item.date,
        approximateTime: approximateTime !== undefined ? approximateTime : item.approximateTime,
        status: status || item.status,
        image: imageUrl,
      },
      { new: true, runValidators: true }
    );

    // Update verification details if found type
    if (item.type === 'found' && verificationDetails) {
      let vd = verificationDetails;
      if (typeof vd === 'string') {
        try { vd = JSON.parse(vd); } catch (e) { vd = {}; }
      }
      await VerificationDetail.findOneAndUpdate(
        { itemId: item._id },
        {
          brand: vd.brand,
          identifyingMarks: vd.identifyingMarks,
          hiddenDetails: vd.hiddenDetails,
          additionalQuestions: vd.additionalQuestions || [],
        },
        { upsert: true, new: true }
      );
    }

    return success(res, { item: updatedItem }, 'Item updated successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   DELETE /api/items/:id
 * @access  Protected (owner or admin)
 */
const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return error(res, 'Item not found', 404);
    }

    const isOwner = item.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return error(res, 'Not authorized to delete this item', 403);
    }

    await Promise.all([
      Claim.deleteMany({ itemId: item._id }),
      VerificationDetail.deleteOne({ itemId: item._id }),
      Notification.deleteMany({ relatedItemId: item._id }),
    ]);
    await item.deleteOne();

    if (item.image?.startsWith('/uploads/')) {
      const filename = path.basename(item.image);
      try {
        await fs.unlink(path.join(__dirname, '..', 'uploads', filename));
      } catch (cleanupError) {
        if (cleanupError.code !== 'ENOENT') {
          console.error(`Failed to remove uploaded image ${filename}: ${cleanupError.message}`);
        }
      }
    }

    return success(res, null, 'Item report deleted successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/items/my-reports
 * @access  Protected
 */
const getMyReports = async (req, res, next) => {
  try {
    const { type, status, page = 1, limit = 10 } = req.query;
    const filter = { userId: req.user._id };

    if (type) filter.type = type;
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Item.countDocuments(filter);
    const items = await Item.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return success(res, {
      items,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/items/:id/matches
 * @access  Protected
 */
const getItemMatches = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return error(res, 'Item not found', 404);
    }

    const matches = await findMatches(item);
    return success(res, { matches });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/items/:id/questions
 * @access  Public
 */
const getItemQuestions = async (req, res) => {
  try {
    const vd = await VerificationDetail.findOne({ itemId: req.params.id });
    if (!vd) return res.json({ success: true, data: { questions: [] } });
    // Only return question text, NOT answers
    const questions = (vd.additionalQuestions || []).map((q) => q.question);
    res.json({ success: true, data: { questions } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getItems,
  createItem,
  getItemById,
  updateItem,
  deleteItem,
  getMyReports,
  getItemMatches,
  getItemQuestions,
};
