const express = require('express');
const router = express.Router();
const { getStripeConfig, createPaymentIntent } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/config', protect, getStripeConfig);
router.post('/create-payment-intent', protect, createPaymentIntent);

module.exports = router;
