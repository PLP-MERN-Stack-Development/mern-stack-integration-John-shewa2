const Post = require('../models/Post');

// Create a new post (only logged-in users)
exports.createPost = async (req, res) => {
  try {
    // Attach authenticated user as author
    req.body.author = req.user.id;
    if (req.file) {
      req.body.featuredImage = `/uploads/${req.file.filename}`;
   }

    const post = await Post.create(req.body);

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all published posts (public feed)
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

// Get single post by slug + auto-increment views
exports.getPostBySlug = async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug })
      .populate('author', 'name')
      .populate('category', 'name');

    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    // Increment view count
    await post.incrementViewCount();

    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get posts only from logged-in user (drafts + published)
exports.getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Publish or unpublish post (only author)
exports.togglePublish = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, author: req.user.id });

    if (!post) return res.status(404).json({ success: false, message: 'Post not found or not yours' });

    post.isPublished = !post.isPublished;
    await post.save();

    res.json({ success: true, data: post });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Add a comment
exports.addComment = async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const updatedPost = await post.addComment(req.user.id, req.body.content);

    res.json({ success: true, data: updatedPost });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a post (only author)
exports.updatePost = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

// Get all posts with optional pagination & category
exports.getAllPosts = async (req, res, next) => {
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

  res.json({ success: true, data: posts, page, totalPages: Math.ceil(total / limit) });
};

// Search posts
exports.searchPosts = async (req, res, next) => {
  const q = req.query.q || '';
  const posts = await Post.find({
    isPublished: true,
    $or: [
      { title: { $regex: q, $options: 'i' } },
      { content: { $regex: q, $options: 'i' } },
    ],
  }).populate('author category');
  res.json({ success: true, data: posts });
};
