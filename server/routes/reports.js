const express = require('express');
const router = express.Router();
const {
  createReport, checkReport, checkBooked,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.post('/:propertyId',          protect, authorize('tenant'), createReport);
router.get('/check/:propertyId',     protect, authorize('tenant'), checkReport);
router.get('/check-booked/:propertyId', protect, authorize('tenant'), checkBooked);

module.exports = router;
