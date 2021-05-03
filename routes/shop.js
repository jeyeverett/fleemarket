const express = require('express');
const router = express.Router();

//Controllers
const { 
    getAllProducts, 
    getProductList,
    getShopIndex, 
    postOrder,
    getCartPage, 
    addToCart,
    decreaseCartCount,
    deleteFromCart,
    getOrdersPage,
    getProductDetails 
} = require('../controllers/shop')

router.get('/', getShopIndex);

router.get('/cart', getCartPage);

router.post('/cart', addToCart);

router.post('/cart/decrease', decreaseCartCount);

router.post('/cart/delete-product', deleteFromCart);

router.get('/orders', getOrdersPage);

router.post('/create-order', postOrder);

router.get('/product-details/:productId', getProductDetails);

router.get('/shop', getAllProducts);

router.get('/product-list', getProductList);


module.exports = router;

