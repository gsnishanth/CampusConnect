const Notification = require('../models/Notification');
const { success, error } = require('../utils/apiResponse');

/**
 * @route   GET /api/notifications
 * @access  Protected
 */
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('relatedItemId', 'title type category');

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false,
    });

    return success(res, { notifications, unreadCount });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PUT /api/notifications/:id/read
 * @access  Protected
 */
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return error(res, 'Notification not found', 404);
    }

    if (notification.userId.toString() !== req.user._id.toString()) {
      return error(res, 'Not authorized', 403);
    }

    notification.isRead = true;
    await notification.save();

    return success(res, { notification }, 'Marked as read');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PUT /api/notifications/read-all
 * @access  Protected
 */
const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );
    return success(res, null, 'All notifications marked as read');
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotifications, markAsRead, markAllRead };
