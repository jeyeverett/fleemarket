const express = require('express');
const router = express.Router();

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
router.get('/add-product', getProductAdd);
router.post('/add-product', postProductAdd);

//READ
router.get('/admin-products', getProducts);

//UPDATE
router.get('/edit-product/:productId', getProductEdit);
router.post('/edit-product', postProductEdit);

//DELETE
router.post('/delete-product', deleteProduct);

module.exports = router;