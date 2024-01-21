const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart');
const {isAuth} = require('../middleware/is_auth');
// POST route to create a new blog
router.post('/api/cart/create',isAuth, cartController.addToCart);
router.get('/api/getcart/:id',isAuth, cartController.getCart);
router.put('/api/blogs/deletetool',isAuth, cartController.removeFromCart);
// router.delete('/api/blogs/delete/:id', cartController.deleteCart);

module.exports = router;