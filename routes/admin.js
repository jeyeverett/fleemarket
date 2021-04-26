const express = require('express');
const router = express.Router();

//Controllers
const { 
    getAddProduct, 
    postAddProduct, 
    getAdminProducts, 
    getEditProduct,
    postEditProduct
} = require('../controllers/admin')

router.get('/add-product', getAddProduct);
router.post('/add-product', postAddProduct);

router.get('/admin-products', getAdminProducts);

router.get('/edit-product/:productId', getEditProduct);
router.post('/edit-product/', postEditProduct);


module.exports = router;