const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Render Home Page
// @route   GET /
// @access  Public
const getHome = asyncHandler(async (req, res) => {
    const keyword = req.query.keyword
        ? {
            name: {
                $regex: req.query.keyword,
                $options: 'i',
            },
        }
        : {};

    const products = await Product.find({ ...keyword }).populate('user', 'name');

    res.render('index', {
        products,
        keyword: req.query.keyword || '',
        viewName: 'home'
    });
});

// @desc    Render Shop Page
// @route   GET /shop
// @access  Public
const getShop = asyncHandler(async (req, res) => {
    const pageSize = 12;
    const page = Number(req.query.pageNumber) || 1;
    const keyword = req.query.keyword
        ? {
            name: {
                $regex: req.query.keyword,
                $options: 'i',
            },
        }
        : {};

    // Category Filter
    if (req.query.category && req.query.category !== 'All') {
        keyword.category = {
            $regex: req.query.category,
            $options: 'i',
        };
    }

    console.log('Filter Keyword:', JSON.stringify(keyword, null, 2)); // Debug log

    const count = await Product.countDocuments({ ...keyword });
    const products = await Product.find({ ...keyword })
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .populate('user', 'name');

    // Get all categories for filter dropdown
    const categories = await Product.distinct('category');

    res.render('shop', {
        products,
        page,
        pages: Math.ceil(count / pageSize),
        keyword: req.query.keyword || '',
        categories,
        currentCategory: req.query.category || 'All',
        viewName: 'shop'
    });
});

// @desc    Render Product Details Page
// @route   GET /product/:id
// @access  Public
const getProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate('user', 'name');

    if (product) {
        // Pagination for reviews
        const page = Number(req.query.page) || 1;
        const pageSize = 5; // Reviews per page
        const totalReviews = product.reviews.length;
        const totalPages = Math.ceil(totalReviews / pageSize);

        // Sort reviews by date (newest first)
        const sortedReviews = product.reviews.sort((a, b) => b.createdAt - a.createdAt);

        const paginatedReviews = sortedReviews.slice(
            (page - 1) * pageSize,
            page * pageSize
        );

        // Overwrite reviews with paginated version for the view
        // But we need to keep the original product object intact for other fields
        // So we pass 'reviews' separately or modify a copy
        // EJS template uses product.reviews, so let's pass a modified object or separate variables
        // Easier to pass separate variables and update EJS

        res.render('product', {
            product,
            reviews: paginatedReviews,
            currentPage: page,
            totalPages: totalPages,
            totalReviews: totalReviews
        });
    } else {
        res.status(404).render('404', { message: 'Product not found' });
    }
});

// @desc    Render Login Page
// @route   GET /login
// @access  Public
const getLogin = (req, res) => {
    res.render('login');
};

// @desc    Render Register Page
// @route   GET /register
// @access  Public
const getRegister = (req, res) => {
    res.render('register');
};

// @desc    Render Cart Page
// @route   GET /cart
// @access  Public
const getCart = (req, res) => {
    res.render('cart');
};

// @desc    Render Profile Page
// @route   GET /profile
// @access  Private (Handled by client-side redirect if no token, or we implement cookie auth later)
const getProfile = (req, res) => {
    res.render('profile');
};

// @desc    Render Seller Dashboard
// @route   GET /seller
// @access  Private/Seller
const getSellerDashboard = (req, res) => {
    res.render('seller');
};

// @desc    Render Admin Dashboard
// @route   GET /admin
// @access  Private/Admin
const getAdminDashboard = (req, res) => {
    res.render('admin');
};

// @desc    Render Forgot Password Page
// @route   GET /forgot-password
// @access  Public
const getForgotPassword = (req, res) => {
    res.render('forgot-password');
};

// @desc    Render Reset Password Page
// @route   GET /reset-password/:token
// @access  Public
const getResetPassword = (req, res) => {
    res.render('reset-password', { token: req.params.token });
};

// @desc    Render Checkout Page
// @route   GET /checkout
// @access  Private (Handled by client-side redirect if no token)
const getCheckout = (req, res) => {
    res.render('checkout');
};

// @desc    Get Terms page
// @route   GET /terms
// @access  Public
const getTerms = asyncHandler(async (req, res) => {
    res.render('terms', {
        page: 'terms',
    });
});

module.exports = {
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
};
