const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json(user.wishlist);
});

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
        if (user.wishlist.includes(productId)) {
            res.status(400);
            throw new Error('Product already in wishlist');
        }

        user.wishlist.push(productId);
        await user.save();
        res.json({ message: 'Product added to wishlist' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:id
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.wishlist = user.wishlist.filter(
            (id) => id.toString() !== req.params.id
        );
        await user.save();
        res.json({ message: 'Product removed from wishlist' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
};
