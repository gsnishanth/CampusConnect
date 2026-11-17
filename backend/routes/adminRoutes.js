const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getUsers,
  getReports,
  getClaims,
  updateUserStatus,
  resolveDispute,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');

router.use(protect, isAdmin);

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.get('/reports', getReports);
router.get('/claims', getClaims);
router.put('/users/:id/status', updateUserStatus);
router.put('/claims/:id/resolve', resolveDispute);

module.exports = router;
