const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  blogTitle: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  coverUrl: {
    type: String,
    required: false,
  },
  blogContent: {
    type: String,
    required: true,
  },
  authername: {
    type: String,
    required: true,
  },
  autherimage: {
    type: String,
    required: false,
  },
},{ timestamps: true });

const BlogModel = mongoose.model('Blog', blogSchema);

module.exports = BlogModel;