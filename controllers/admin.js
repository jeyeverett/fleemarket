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
    product.save()
        .then(() => res.redirect('/shop'))
        .catch(err => console.log(err));
}

const getEditProduct = (req, res) => {
    const editMode = req.query.edit;
    if (!editMode) return res.redirect('/');
    const productId = req.params.productId;
    Product.findById(productId).then(([rows]) => {
        rows ?
            res.render('admin/edit-product.ejs', 
            { 
                pageTitle: 'Admin | Edit Product', 
                path: '/admin/edit-product',
                edit: editMode,
                product: rows[0]
            })
            :
            res.redirect('/'); //Change later to redirect to error page
    });
}

const postEditProduct = (req, res) => {
    const { title, price, imageUrl, description, id } = req.body
    const updatedProduct = new Product(title, price, imageUrl, description, id);
    updatedProduct.save();
    res.redirect('/admin/admin-products');
}

const getProducts = (req, res) => {
    Product.fetchAll()
        .then(([rows]) => {
            res.render('admin/admin-products', 
            { 
                pageTitle: 'Admin | Products', 
                products: rows, 
                path: '/admin/admin-products'
            });
    }).catch(err => console.log(err));
}

const deleteProduct = (req, res) => {
    const id = req.body.id;
    Product.findByIdAndDelete(id, () => res.redirect('/admin/admin-products'));
}

module.exports = {
    getAddProduct,
    postAddProduct,
    getProducts,
    getEditProduct,
    postEditProduct,
    deleteProduct
}