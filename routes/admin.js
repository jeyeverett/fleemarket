const express = require('express');
const router = express.Router();

// Middleware
const {
    isLoggedIn
} = require('../middleware/is-auth');

//Controllers
const { 
    getProductAdd, 
    postProductAdd,
    getProducts,
    getProductEdit,
    postProductEdit,
    deleteProduct
} = require('../controllers/admin')

//CREATE
router.get('/add-product', isLoggedIn, getProductAdd);
router.post('/add-product', isLoggedIn, postProductAdd);

//READ
router.get('/admin-products', isLoggedIn, getProducts);

//UPDATE
router.get('/edit-product/:productId', isLoggedIn, getProductEdit);
router.post('/edit-product', isLoggedIn, postProductEdit);

//DELETE
router.post('/delete-product', isLoggedIn, deleteProduct);

module.exports = router;