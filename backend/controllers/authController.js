const User = require('../models/User');
const { success, error } = require('../utils/apiResponse');

/**
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, collegeId } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const allowedDomain = (process.env.COLLEGE_EMAIL_DOMAIN || 'cbit.ac.in')
      .trim()
      .replace(/^@/, '')
      .toLowerCase();

    if (!name || !email || !password) {
      return error(res, 'Name, college email and password are required', 400);
    }

    if (!normalizedEmail.endsWith(`@${allowedDomain}`)) {
      return error(res, `Use your college email ending in @${allowedDomain}`, 400);
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return error(res, 'Email already registered', 409);
    }

    const user = await User.create({ name, email: normalizedEmail, password, collegeId, role: 'student' });

    const token = user.generateToken();

    return success(
      res,
      {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          collegeId: user.collegeId,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
      },
      'Registration successful',
      201
    );
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return error(res, 'Email and password are required', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return error(res, 'Invalid email or password', 401);
    }

    if (!user.isActive) {
      return error(res, 'Your account has been deactivated', 401);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return error(res, 'Invalid email or password', 401);
    }

    const token = user.generateToken();

    return success(res, {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        collegeId: user.collegeId,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/auth/me
 * @access  Protected
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return error(res, 'User not found', 404);
    }
    return success(res, { user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe };
