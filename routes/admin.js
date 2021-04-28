const express = require('express');
const router = express.Router();

//Controllers
const { 
    getAddProduct, 
    postAddProduct, 
    getProducts, 
    getEditProduct,
    postEditProduct,
    deleteProduct
} = require('../controllers/admin')

//CREATE
router.get('/add-product', getAddProduct);
router.post('/add-product', postAddProduct);

//READ
router.get('/admin-products', getProducts);

//UPDATE
router.get('/edit-product/:productId', getEditProduct);
router.post('/edit-product', postEditProduct);

//DELETE
router.post('/delete-product', deleteProduct);

module.exports = router;