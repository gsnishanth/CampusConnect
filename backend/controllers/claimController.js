const Item = require('../models/Item');
const Claim = require('../models/Claim');
const VerificationDetail = require('../models/VerificationDetail');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');
const { success, error } = require('../utils/apiResponse');

/**
 * Normalize a string for comparison.
 */
const normalize = (str = '') => str
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9\s]/g, '')
  .replace(/\s+/g, ' ');

const answerMatch = (actual = '', expected = '') => {
  const normalizedActual = normalize(actual);
  const normalizedExpected = normalize(expected);
  if (!normalizedActual || !normalizedExpected) return 0;
  if (normalizedActual === normalizedExpected) return 1;

  const actualWords = new Set(normalizedActual.split(' ').filter(Boolean));
  const expectedWords = new Set(normalizedExpected.split(' ').filter(Boolean));
  if (expectedWords.size === 0) return 0;
  const overlap = [...expectedWords].filter((word) => actualWords.has(word)).length;
  return overlap / expectedWords.size;
};

const calculateVerificationScore = (vd, answers = []) => {
  if (!vd) return 0;
  let earned = 0;
  let weight = 0;

  const fields = [
    ['brand', 30],
    ['identifyingMarks', 30],
    ['hiddenDetails', 25],
  ];

  for (const [field, fieldWeight] of fields) {
    if (vd[field]) {
      weight += fieldWeight;
      earned += fieldWeight * answerMatch(
        answers.find((answer) => normalize(answer.question) === normalize(field))?.answer,
        vd[field]
      );
    }
  }

  if (vd.additionalQuestions?.length) {
    const customWeight = 15 / vd.additionalQuestions.length;
    for (const question of vd.additionalQuestions) {
      if (!normalize(question.answer)) continue;
      weight += customWeight;
      const claimantAnswer = answers.find(
        (answer) => normalize(answer.question) === normalize(question.question)
      );
      earned += customWeight * answerMatch(claimantAnswer?.answer, question.answer);
    }
  }

  return weight > 0 ? Math.round((earned / weight) * 100) : 0;
};

const withoutClaimantScore = (claim) => {
  const sanitized = typeof claim.toObject === 'function' ? claim.toObject() : { ...claim };
  delete sanitized.verificationScore;
  return sanitized;
};

/**
 * @route   POST /api/claims
 * @access  Protected
 */
const createClaim = async (req, res, next) => {
  try {
    const { itemId, answers = [] } = req.body;

    // 1. Verify item is found type and active
    const item = await Item.findById(itemId);
    if (!item) {
      return error(res, 'Item not found', 404);
    }
    if (item.type !== 'found') {
      return error(res, 'You can only claim items of type "found"', 400);
    }
    if (item.status !== 'active') {
      return error(res, 'This item is no longer available for claims', 400);
    }

    // Prevent owner from claiming their own item
    if (item.userId.toString() === req.user._id.toString()) {
      return error(res, 'You cannot claim your own item', 400);
    }

    // 2. Check no existing pending/approved claim
    const existingClaim = await Claim.findOne({
      itemId,
      claimantId: req.user._id,
      status: { $in: ['pending', 'approved'] },
    });
    if (existingClaim) {
      return error(res, 'You already have a pending or approved claim for this item', 409);
    }

    // 3. Fetch verification details
    const vd = await VerificationDetail.findOne({ itemId });

    const verificationScore = calculateVerificationScore(vd, answers);

    // 5. Save claim (without correct answers)
    const claim = await Claim.create({
      itemId,
      claimantId: req.user._id,
      answers: answers.map((a) => ({ question: a.question, answer: a.answer })),
      verificationScore,
      status: 'pending',
    });

    // 6. Notify item owner
    await createNotification(
      item.userId,
      'New Claim on Your Item',
      `Someone has submitted a claim for your found item "${item.title}". Verification score: ${verificationScore}%.`,
      'claim',
      item._id
    );

    // 7. Return claim without revealing correct answers
    return success(res, { claim: withoutClaimantScore(claim) }, 'Claim submitted successfully', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/claims/my
 * @access  Protected
 */
const getMyClaims = async (req, res, next) => {
  try {
    const claims = await Claim.find({ claimantId: req.user._id })
      .populate('itemId', 'title category location type status image date')
      .sort({ createdAt: -1 });

    const sanitizedClaims = claims.map(withoutClaimantScore);
    return success(res, { claims: sanitizedClaims });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/claims/incoming
 * @access  Protected
 */
const getIncomingClaims = async (req, res, next) => {
  try {
    // Find all items owned by the current user
    const myItems = await Item.find({ userId: req.user._id }).select('_id');
    const myItemIds = myItems.map((i) => i._id);

    const claims = await Claim.find({ itemId: { $in: myItemIds } })
      .populate('itemId', 'title category location type status image date')
      .populate('claimantId', 'name email collegeId')
      .sort({ createdAt: -1 });

    return success(res, { claims });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/claims/:id
 * @access  Protected (claimant, item owner, or admin)
 */
const getClaimById = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('itemId', 'title category location type status image date userId')
      .populate('claimantId', 'name email collegeId');

    if (!claim) {
      return error(res, 'Claim not found', 404);
    }

    const userId = req.user._id.toString();
    const isClaimant = claim.claimantId._id.toString() === userId;
    const isItemOwner = claim.itemId.userId && claim.itemId.userId.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isClaimant && !isItemOwner && !isAdmin) {
      return error(res, 'Not authorized to view this claim', 403);
    }

    const responseClaim = isClaimant ? withoutClaimantScore(claim) : claim;
    return success(res, { claim: responseClaim });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PUT /api/claims/:id/decision
 * @access  Protected (item owner or admin)
 */
const makeDecision = async (req, res, next) => {
  try {
    const { status, decisionNote } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return error(res, 'Status must be "approved" or "rejected"', 400);
    }

    const claim = await Claim.findById(req.params.id).populate('itemId');
    if (!claim) {
      return error(res, 'Claim not found', 404);
    }

    const item = claim.itemId;
    const userId = req.user._id.toString();
    const isItemOwner = item.userId.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isItemOwner && !isAdmin) {
      return error(res, 'Not authorized to make a decision on this claim', 403);
    }

    claim.status = status;
    claim.decisionNote = decisionNote;
    claim.reviewedBy = req.user._id;
    await claim.save();

    // If approved, update item status and notify claimant
    if (status === 'approved') {
      await Item.findByIdAndUpdate(item._id, { status: 'matched' });
      await Claim.updateMany(
        {
          itemId: item._id,
          _id: { $ne: claim._id },
          status: 'pending',
        },
        {
          $set: {
            status: 'rejected',
            decisionNote: 'Another claim was approved for this item.',
          },
        }
      );
      await createNotification(
        claim.claimantId,
        'Claim Approved!',
        `Your claim for "${item.title}" has been approved! Please contact the finder to arrange return.`,
        'decision',
        item._id
      );
    } else {
      await createNotification(
        claim.claimantId,
        'Claim Rejected',
        `Your claim for "${item.title}" was rejected.${decisionNote ? ' Note: ' + decisionNote : ''}`,
        'decision',
        item._id
      );
    }

    return success(res, { claim }, `Claim ${status}`);
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PUT /api/claims/:id/dispute
 * @access  Protected (claimant only)
 */
const disputeClaim = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id).populate('itemId', 'title');
    if (!claim) {
      return error(res, 'Claim not found', 404);
    }

    if (claim.claimantId.toString() !== req.user._id.toString()) {
      return error(res, 'Only the claimant can dispute a claim', 403);
    }

    if (claim.status !== 'rejected') {
      return error(res, 'Only rejected claims can be disputed', 400);
    }

    claim.status = 'disputed';
    await claim.save();

    // Notify all admins
    const admins = await User.find({ role: 'admin', isActive: true }).select('_id');
    for (const admin of admins) {
      await createNotification(
        admin._id,
        'Claim Dispute Raised',
        `A claimant has disputed the rejection of their claim for item "${claim.itemId.title}". Please review.`,
        'claim',
        claim.itemId._id
      );
    }

    return success(res, { claim }, 'Claim has been escalated to dispute');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PUT /api/claims/:id/return
 * @access  Protected (item owner)
 */
const markReturned = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id).populate('itemId');
    if (!claim) {
      return error(res, 'Claim not found', 404);
    }

    const item = claim.itemId;
    if (item.userId.toString() !== req.user._id.toString()) {
      return error(res, 'Only the finder can mark the item as returned', 403);
    }
    if (claim.status !== 'approved') {
      return error(res, 'The claim must be approved before marking the item as returned', 400);
    }

    await Item.findByIdAndUpdate(item._id, { status: 'returned' });
    await Claim.updateMany(
      { itemId: item._id },
      { $set: { status: 'closed' } }
    );
    await createNotification(
      claim.claimantId,
      'Item Returned',
      `The finder confirmed that "${item.title}" was returned successfully.`,
      'return',
      item._id
    );

    return success(res, { itemStatus: 'returned', claimStatus: 'closed' }, 'Item marked as returned');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createClaim,
  getMyClaims,
  getIncomingClaims,
  getClaimById,
  makeDecision,
  disputeClaim,
  markReturned,
};
