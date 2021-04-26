const Product = require('../models/product');

const getAddProduct = (req, res) => {
    res.render('admin/edit-product', 
    { 
        pageTitle: 'Admin | Add Product', 
        path: '/admin/add-product',
        edit: false
    });
}

const postAddProduct = (req, res) => {
    const { title, price, imageUrl, description } = req.body;
    const product = new Product(title, price, imageUrl, description);
    product.save();
    res.redirect('/shop');
}

const getEditProduct = (req, res) => {
    const editMode = req.query.edit;
    if (!editMode) return res.redirect('/');
    const productId = req.params.productId;
    Product.findById(productId, product => {
        product ?
            res.render('admin/edit-product.ejs', 
            { 
                pageTitle: 'Admin | Edit Product', 
                path: '/admin/edit-product',
                edit: editMode,
                product
            })
            :
            res.redirect('/');
    });
}

const postEditProduct = (req, res) => {

}

const getAdminProducts = (req, res) => {
    Product.fetchAll(products => {
        res.render('admin/admin-products', 
        { 
            pageTitle: 'Admin | Products', 
            products, 
            path: '/admin/admin-products'
        });
    });
}

module.exports = {
    getAddProduct,
    postAddProduct,
    getAdminProducts,
    getEditProduct,
    postEditProduct
}