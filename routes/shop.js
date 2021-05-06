const express = require('express');
const router = express.Router();

// Middleware
const {
    isLoggedIn
} = require('../middleware/is-auth');

//Controllers
const { 
    getAllProducts, 
    getProductList,
    getShopIndex,
    postOrder,
    getCartPage, 
    addToCart,
    decreaseCartItemCount,
    deleteFromCart,
    getOrdersPage,
    getProductDetails 
} = require('../controllers/shop')

router.get('/', getShopIndex);

router.get('/cart', isLoggedIn, getCartPage);

router.post('/cart', isLoggedIn, addToCart);

router.post('/cart/decrease', isLoggedIn, decreaseCartItemCount);

router.post('/cart/delete-product', isLoggedIn, deleteFromCart);

router.get('/orders', isLoggedIn, getOrdersPage);

router.post('/create-order', isLoggedIn, postOrder);

router.get('/product-details/:productId', getProductDetails);

router.get('/shop', getAllProducts);

router.get('/product-list', getProductList);


module.exports = router;

