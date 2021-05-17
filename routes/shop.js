const express = require('express');
const router = express.Router();

// Middleware
const {
    isLoggedIn
} = require('../middleware/is-auth');

//Controllers
const { 
    getAllProducts, 
    getShopIndex,
    getCheckoutSuccess,
    getCartPage, 
    addToCart,
    decreaseCartItemCount,
    deleteFromCart,
    getOrdersPage,
    getProductDetails,
    getInvoice,
    getCheckoutPage
} = require('../controllers/shop')

router.get('/', getShopIndex);

router.get('/cart', isLoggedIn, getCartPage);

router.post('/cart', isLoggedIn, addToCart);

router.post('/cart/decrease', isLoggedIn, decreaseCartItemCount);

router.post('/cart/delete-product', isLoggedIn, deleteFromCart);

router.get('/orders', isLoggedIn, getOrdersPage);

router.get('/checkout', isLoggedIn, getCheckoutPage);

router.get('/checkout/success', isLoggedIn, getCheckoutSuccess);

router.get('/checkout/cancel', isLoggedIn, getCheckoutPage);

router.get('/product-details/:productId', getProductDetails);

router.get('/shop', getAllProducts);

router.get('/orders/:orderId', isLoggedIn, getInvoice);


module.exports = router;

