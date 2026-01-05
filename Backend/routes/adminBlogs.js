// routes/adminBlogs.js
const express = require("express");
const router = express.Router();
const BlogPost = require("../models/BlogPost");
const auth = require("../middleware/auth");

// GET all blogs (draft + published)
router.get("/", auth, async (req, res) => {
  const blogs = await BlogPost.find()
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: blogs,
  });
});

module.exports = router;
