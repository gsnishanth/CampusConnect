const { error } = require('../utils/apiResponse');

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return error(res, 'Access denied: Admin only', 403);
};

const isStudent = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    return next();
  }
  return error(res, 'Access denied: Students only', 403);
};

module.exports = { isAdmin, isStudent };
