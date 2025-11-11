const express = require('express');
const router = express.Router();

const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// public routes
router.post('/register', register);
router.post('/login', login);

// private route (requires token)
router.get('/me', protect, getMe);

module.exports = router;