const express = require('express');
const router = express.Router();
const {
  createClaim,
  getMyClaims,
  getIncomingClaims,
  getClaimById,
  makeDecision,
  disputeClaim,
} = require('../controllers/claimController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createClaim);
router.get('/my', getMyClaims);
router.get('/incoming', getIncomingClaims);
router.get('/:id', getClaimById);
router.put('/:id/decision', makeDecision);
router.put('/:id/dispute', disputeClaim);

module.exports = router;
