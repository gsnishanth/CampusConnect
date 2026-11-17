const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { error } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return error(res, 'Not authorized, no token', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return error(res, 'User not found', 401);
    }

    if (!user.isActive) {
      return error(res, 'Your account has been deactivated', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    return error(res, 'Not authorized, token invalid', 401);
  }
};

module.exports = { protect };
