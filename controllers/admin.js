const Product = require('../models/product');

const getProductAdd = (req, res) => {
    res.render('admin/edit-product', 
    { 
        pageTitle: 'Admin | Add Product', 
        path: '/admin/add-product',
        edit: false
    });
}

const postProductAdd = (req, res) => {
    const { title, price, imageUrl, description } = req.body;
    const product = new Product(title, price, description, imageUrl, req.user._id);
    product.save()
        .then(() => res.redirect('/admin/admin-products'))
        .catch(err => console.log(err));
}

const getProductEdit = (req, res) => {
    const editMode = req.query.edit;
    if (!editMode) return res.redirect('/');
    const productId = req.params.productId;
    Product.findById(productId)
        .then(product => {
            product ?
                res.render('admin/edit-product.ejs', 
                { 
                    pageTitle: 'Admin | Edit Product', 
                    path: '/admin/edit-product',
                    edit: editMode,
                    product
                })
                :
                res.status(401).redirect('/'); //Change later to redirect to error page
        })
        .catch(err => console.log(err));
}

const postProductEdit = (req, res) => {
    const { title, price, imageUrl, description, id } = req.body;
    Product.update({ title, price, description, imageUrl, id })
        .then(() => res.redirect('/admin/admin-products'))
        .catch(err => console.log(err));
}

const getProducts = (req, res) => {
    Product.fetchAll()
        .then(products => {
            res.render('admin/admin-products', 
            { 
                pageTitle: 'Admin | Products', 
                products: products, 
                path: '/admin/admin-products'
            });
        })
        .catch(err => console.log(err));
}

const deleteProduct = (req, res) => {
   Product.deleteById(req.body.id)
        .then(() => res.redirect('/admin/admin-products'))
        .catch(err => console.log(err));
}

module.exports = {
    getProductAdd,
    postProductAdd,
    getProducts,
    getProductEdit,
    postProductEdit,
    deleteProduct
}