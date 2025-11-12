// controllers/postController.js
const Post = require('../models/Post');

// =====================
// CREATE A NEW POST
// =====================
exports.createPost = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { title, content, category, tags, excerpt, isPublished } = req.body;

    // Basic validation
    if (!title || !content || !category) {
      return res
        .status(400)
        .json({ success: false, message: 'Title, content, and category are required' });
    }

    // Prepare new post data
    const newPostData = {
      title,
      content,
      category,
      author: req.user.id,
      isPublished: isPublished || false,
      excerpt: excerpt || content.substring(0, 150) + '...',
      tags: tags ? tags.split(',').map((t) => t.trim()) : [],
    };

    // Handle featured image if uploaded
    if (req.file) {
      newPostData.featuredImage = `/uploads/${req.file.filename}`;
    }

    // Create and save post
    const post = new Post(newPostData);
    await post.save();

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    console.error('Error creating post:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

// =====================
// GET ALL PUBLISHED POSTS (PUBLIC FEED)
// =====================
exports.getPublishedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ isPublished: true })
      .populate('author', 'name')
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =====================
// GET SINGLE POST BY SLUG + INCREMENT VIEWS
// =====================
exports.getPostBySlug = async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug })
      .populate('author', 'name')
      .populate('category', 'name');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    await post.incrementViewCount();
    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =====================
// GET MY POSTS (LOGGED-IN USER ONLY)
// =====================
exports.getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =====================
// TOGGLE PUBLISH STATUS
// =====================
exports.togglePublish = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, author: req.user.id });

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: 'Post not found or not authorized' });
    }

    post.isPublished = !post.isPublished;
    await post.save();

    res.json({ success: true, data: post });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// =====================
// ADD A COMMENT
// =====================
exports.addComment = async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const updatedPost = await post.addComment(req.user.id, req.body.content);
    res.json({ success: true, data: updatedPost });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =====================
// UPDATE POST (AUTHOR ONLY)
// =====================
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, author: req.user.id },
      req.body,
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found or not authorized' });
    }

    res.json({ success: true, data: post });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// =====================
// GET ALL POSTS (ADMIN OR PUBLIC LIST)
// =====================
exports.getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;

    const query = { isPublished: true };
    if (category) query.category = category;

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author category');

    const total = await Post.countDocuments(query);

    res.json({
      success: true,
      data: posts,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =====================
// SEARCH POSTS
// =====================
exports.searchPosts = async (req, res) => {
  try {
    const q = req.query.q || '';
    const posts = await Post.find({
      isPublished: true,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
      ],
    }).populate('author category');

    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
