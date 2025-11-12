// routes/posts.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  createPost,
  getPublishedPosts,
  getPostBySlug,
  getMyPosts,
  togglePublish,
  addComment,
  updatePost,
  getAllPosts,
  searchPosts,
} = require("../controllers/postController");

// ---------- PUBLIC ROUTES ----------
router.get("/", getPublishedPosts); // public feed (published only)
router.get("/all", getAllPosts); // all posts (admin or for pagination)
router.get("/search", searchPosts);
router.get("/:slug", getPostBySlug); // single post by slug

// ---------- AUTHENTICATED USER ROUTES ----------
router.post("/", protect, upload.single("featuredImage"), createPost);
router.get("/me/myposts", protect, getMyPosts);
router.patch("/:id/publish", protect, togglePublish);
router.post("/:slug/comment", protect, addComment);
router.put("/:id", protect, updatePost);

module.exports = router;
