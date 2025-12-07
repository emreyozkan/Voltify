const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    deleteProduct,
    updateProduct,
    createProduct,
    createProductReview,
    deleteProductReview,
    getTopProducts,
    getCategories,
    getMyProducts,
} = require('../controllers/productController');
const { protect, seller } = require('../middleware/authMiddleware');

router.route('/').get(getProducts).post(protect, createProduct);
router.get('/my', protect, getMyProducts);
router.get('/top', getTopProducts);
router.get('/categories', getCategories);
router.route('/:id/reviews').post(protect, createProductReview);
router.route('/:id/reviews/:reviewId').delete(protect, deleteProductReview);
router
    .route('/:id')
    .get(getProductById)
    .delete(protect, seller, deleteProduct)
    .put(protect, seller, updateProduct);

module.exports = router;
