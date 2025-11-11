const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const {
  createPost,
  getPublishedPosts,
  getPostBySlug,
  getMyPosts,
  togglePublish,
  addComment,
  updatePost,
  getAllPosts,
  searchPosts
} = require('../controllers/postController');

// Public feed
router.get('/', getPublishedPosts);

// Single post public
router.get('/:slug', getPostBySlug);

// Logged-in user actions
router.post('/', protect, upload.single('featuredImage'), createPost);
router.get('/me/myposts', protect, getMyPosts);
router.patch('/:id/publish', protect, togglePublish);
router.post('/:slug/comment', protect, addComment);
router.post('/:id', protect, updatePost);
router.get('/', getAllPosts);
router.get('/search', searchPosts)

module.exports = router;
