const express = require('express');
const router = express.Router();
const {
  getItems,
  createItem,
  getItemById,
  updateItem,
  deleteItem,
  getMyReports,
  getItemMatches,
  getItemQuestions,
} = require('../controllers/itemController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/uploadMiddleware');

router.get('/', getItems);
router.post('/', protect, upload, createItem);
router.get('/my-reports', protect, getMyReports);
router.get('/:id/questions', getItemQuestions);
router.get('/:id', getItemById);
router.put('/:id', protect, upload, updateItem);
router.delete('/:id', protect, deleteItem);
router.get('/:id/matches', protect, getItemMatches);

module.exports = router;
