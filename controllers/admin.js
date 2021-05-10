const Product = require('../models/product');
const { validationResult } = require('express-validator');

// READ
const getProducts = (req, res) => {
    Product.find({ userId: req.session.userId })
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

// CREATE
const getProductAdd = (req, res) => {
    res.render('admin/edit-product', 
    { 
        pageTitle: 'Admin | Add Product', 
        path: '/admin/add-product',
        edit: false,
        validationErrors: [],
        input: { title: null, price: null, imageUrl: null, description: null }
    });
}

const postProductAdd = (req, res) => {
    const { title, price, imageUrl, description } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.locals.errorMessage = errors.array();
        return res.status(422)
            .render('admin/edit-product', 
                { 
                    pageTitle: 'Admin | Add Product', 
                    path: '/admin/add-product',
                    edit: false,
                    validationErrors: errors.array(),
                    input: { title, price, imageUrl, description }
                });
    }

    const product = new Product({ title, price, description, imageUrl, userId: req.user });
    product.save()
        .then(() => res.redirect('/admin/admin-products'))
        .catch(err => console.log(err));
}

// UPDATE
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
                    product,
                    validationErrors: [],
                    input: null
                })
                :
                res.status(401).redirect('/'); //Change later to redirect to error page
        })
        .catch(err => console.log(err));
}

const postProductEdit = (req, res) => {
    const { title, price, description, imageUrl, id } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.locals.errorMessage = errors.array();
        return res.status(422)
            .render('admin/edit-product', 
                { 
                    pageTitle: 'Admin | Edit Product', 
                    path: '/admin/edit-product',
                    edit: true,
                    validationErrors: errors.array(),
                    input: { title, price, imageUrl, description }
                });
    }

    Product.findById(id)
        .then(product => {
            if (product.userId.toString() !== req.session.userId.toString()) {
                req.flash('error', 'You are not authorized to edit this product.');
                return res.redirect('/');
            }
            product.title = title;
            product.price = price;
            product.description = description;
            product.imageUrl = imageUrl;
            return product.save()
                .then(() => res.redirect('/admin/admin-products'))
        })
        .catch(err => console.log(err));
}

// DELETE
const deleteProduct = (req, res) => {
   Product.deleteOne({ _id: req.body.id, userId: req.session.userId })
        .then(() => req.user.deleteFromCart(req.body.id))
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