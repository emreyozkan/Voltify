const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
        res.json(cart.cartItems);
    } else {
        res.json([]);
    }
});

// @desc    Add item to cart or update quantity
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
    const { product, name, qty, image, price, discountedPrice } = req.body;

    // Use discounted price if available and valid, otherwise use regular price
    const finalPrice = (discountedPrice && discountedPrice > 0) ? discountedPrice : price;

    let cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
        const itemIndex = cart.cartItems.findIndex(
            (item) => item.product.toString() === product
        );

        if (itemIndex > -1) {
            cart.cartItems[itemIndex].qty = qty;
        } else {
            cart.cartItems.push({ product, name, qty, image, price: finalPrice });
        }
    } else {
        cart = new Cart({
            user: req.user._id,
            cartItems: [{ product, name, qty, image, price: finalPrice }],
        });
    }

    const updatedCart = await cart.save();
    res.json(updatedCart.cartItems);
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
        cart.cartItems = cart.cartItems.filter(
            (item) => item.product.toString() !== req.params.id
        );

        const updatedCart = await cart.save();
        res.json(updatedCart.cartItems);
    } else {
        res.status(404);
        throw new Error('Cart not found');
    }
});

// @desc    Clear user cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
        cart.cartItems = [];
        await cart.save();
        res.json({ message: 'Cart cleared' });
    } else {
        res.status(404);
        throw new Error('Cart not found');
    }
});

module.exports = {
    getCart,
    addToCart,
    removeFromCart,
    clearCart,
};
