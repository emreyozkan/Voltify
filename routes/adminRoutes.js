const express = require('express');
const router = express.Router();
const {
    getUsers,
    deleteUser,
    getUserById,
    updateUser,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/users').get(protect, admin, getUsers);
router
    .route('/users/:id')
    .delete(protect, admin, deleteUser)
    .get(protect, admin, getUserById)
    .put(protect, admin, updateUser);

module.exports = router;
