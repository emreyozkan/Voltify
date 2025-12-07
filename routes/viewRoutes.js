const express = require('express');
const router = express.Router();
const { protect, admin, seller } = require('../middleware/authMiddleware');
const {
    getHome,
    getShop,
    getProduct,
    getLogin,
    getRegister,
    getCart,
    getProfile,
    getSellerDashboard,
    getAdminDashboard,
    getForgotPassword,
    getResetPassword,
    getCheckout,
    getTerms
} = require('../controllers/viewController');

router.get('/', getHome);
router.get('/product/:id', getProduct);
router.get('/login', getLogin);
router.get('/register', getRegister);
router.get('/profile', protect, getProfile);
router.get('/cart', protect, getCart);
router.get('/shop', getShop);
router.get('/seller', protect, seller, getSellerDashboard);
router.get('/admin', protect, admin, getAdminDashboard);
router.get('/forgot-password', getForgotPassword);
router.get('/reset-password/:token', getResetPassword);
router.get('/checkout', protect, getCheckout);
router.get('/terms', getTerms);

module.exports = router;
