const Notification = require('../models/Notification');

/**
 * Create and persist a notification.
 * @param {string|ObjectId} userId
 * @param {string} title
 * @param {string} message
 * @param {string} type - match|claim|decision|return|system
 * @param {string|ObjectId|null} relatedItemId
 * @returns {Promise<Notification>}
 */
const createNotification = async (
  userId,
  title,
  message,
  type,
  relatedItemId = null
) => {
  const notification = new Notification({
    userId,
    title,
    message,
    type,
    relatedItemId: relatedItemId || undefined,
  });
  await notification.save();
  return notification;
};

module.exports = { createNotification };
