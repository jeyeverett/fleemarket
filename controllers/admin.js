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
    req.user.createProduct(
        {
            title: title,
            price: price,
            imageUrl: imageUrl,
            description: description
        })
        .then(() => res.redirect('/admin/admin-products'))
        .catch(err => console.log(err));
}

const getProductEdit = (req, res) => {
    const editMode = req.query.edit;
    if (!editMode) return res.redirect('/');
    const productId = req.params.productId;
    req.user.getProducts({ where: { id: productId } })
        .then(products => {
            products[0].dataValues ?
                res.render('admin/edit-product.ejs', 
                { 
                    pageTitle: 'Admin | Edit Product', 
                    path: '/admin/edit-product',
                    edit: editMode,
                    product: products[0].dataValues
                })
                :
                res.status(401).redirect('/'); //Change later to redirect to error page
        })
        .catch(err => console.log(err));
}

const postProductEdit = (req, res) => {
    const { title, price, imageUrl, description, id } = req.body
    req.user.getProducts({ where: { id: id } })
        .then(products => {
            const product = products[0];
            product.title = title;
            product.price = price;
            product.imageUrl = imageUrl;
            product.description = description;
            return product.save()
        })
        .then(() => res.redirect('/admin/admin-products'))
        .catch(err => console.log(err));
}

const getProducts = (req, res) => {
    req.user.getProducts()
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
    req.user.getProducts({ where: { id: req.body.id } })
        .then(product => {
            return product[0].destroy();
        })
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