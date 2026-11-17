const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const { createNotification } = require('../services/notificationService');
const { success, error } = require('../utils/apiResponse');

/**
 * @route   GET /api/admin/dashboard
 * @access  Admin
 */
const getDashboard = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    const itemsByType = await Item.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    const itemsByStatus = await Item.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const claimsByStatus = await Claim.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const totalItems = await Item.countDocuments();
    const totalClaims = await Claim.countDocuments();

    return success(res, {
      users: { total: totalUsers, active: activeUsers },
      items: {
        total: totalItems,
        byType: itemsByType,
        byStatus: itemsByStatus,
      },
      claims: {
        total: totalClaims,
        byStatus: claimsByStatus,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/admin/users
 * @access  Admin
 */
const getUsers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { collegeId: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return success(res, {
      users,
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
 * @route   GET /api/admin/reports
 * @access  Admin
 */
const getReports = async (req, res, next) => {
  try {
    const { type, category, status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Item.countDocuments(filter);
    const items = await Item.find(filter)
      .populate('userId', 'name email')
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
 * @route   GET /api/admin/claims
 * @access  Admin
 */
const getClaims = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Claim.countDocuments(filter);
    const claims = await Claim.find(filter)
      .populate('itemId', 'title category location type status')
      .populate('claimantId', 'name email collegeId')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return success(res, {
      claims,
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
 * @route   PUT /api/admin/users/:id/status
 * @access  Admin
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return error(res, 'User not found', 404);
    }

    if (user.role === 'admin') {
      return error(res, 'Cannot deactivate admin accounts', 400);
    }

    user.isActive = !user.isActive;
    await user.save();

    return success(
      res,
      { user: { _id: user._id, name: user.name, email: user.email, isActive: user.isActive } },
      `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
    );
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PUT /api/admin/claims/:id/resolve
 * @access  Admin
 */
const resolveDispute = async (req, res, next) => {
  try {
    const { status, decisionNote } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return error(res, 'Status must be "approved" or "rejected"', 400);
    }

    const claim = await Claim.findById(req.params.id).populate('itemId', 'title _id userId');
    if (!claim) {
      return error(res, 'Claim not found', 404);
    }

    claim.status = status;
    claim.decisionNote = decisionNote;
    claim.reviewedBy = req.user._id;
    await claim.save();

    if (status === 'approved') {
      await Item.findByIdAndUpdate(claim.itemId._id, { status: 'matched' });
      await createNotification(
        claim.claimantId,
        'Dispute Resolved – Claim Approved',
        `Admin resolved your disputed claim for "${claim.itemId.title}" in your favor.`,
        'decision',
        claim.itemId._id
      );
      await createNotification(
        claim.itemId.userId,
        'Dispute Resolved',
        `Admin resolved a disputed claim on your item "${claim.itemId.title}" as approved.`,
        'decision',
        claim.itemId._id
      );
    } else {
      await createNotification(
        claim.claimantId,
        'Dispute Resolved – Claim Rejected',
        `Admin reviewed and rejected your disputed claim for "${claim.itemId.title}".${decisionNote ? ' Note: ' + decisionNote : ''}`,
        'decision',
        claim.itemId._id
      );
    }

    return success(res, { claim }, 'Dispute resolved');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard,
  getUsers,
  getReports,
  getClaims,
  updateUserStatus,
  resolveDispute,
};
