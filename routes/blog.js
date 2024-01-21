const express = require('express');
const router = express.Router();
const blogController = require('../controllers/Blog');
const { imageMulter } = require('../multer/multerImg'); 
// POST route to create a new blog
router.post('/api/blogs/create',imageMulter, blogController.createBlog);
router.put('/api/blogs/update/:id',imageMulter, blogController.updateBlog);
router.get('/api/blogs/getoneblog/:id', blogController.getOneBlog);
router.get('/api/blogs', blogController.getAllBlogs);
router.delete('/api/blogs/delete/:id', blogController.deleteBlog);

module.exports = router;