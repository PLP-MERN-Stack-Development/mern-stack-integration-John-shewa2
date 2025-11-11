const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

// Public
router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);

// Protected (admin-only inside controller)
router.post('/', protect, createCategory);
router.put('/:id', protect, updateCategory);
router.delete('/:id', protect, deleteCategory);

module.exports = router;
