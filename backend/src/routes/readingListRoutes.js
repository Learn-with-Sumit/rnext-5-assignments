const express = require('express');
const router = express.Router();
const readingListController = require('../controllers/readingListController');

router.get('/', readingListController.getReadingList);
router.get('/summary', readingListController.getReadingSummary);
router.post('/', readingListController.addToReadingList);
router.patch('/:id', readingListController.updateReadingProgress);
router.put('/:id', readingListController.updateReadingProgress);
router.delete('/:id', readingListController.removeFromReadingList);

module.exports = router;
