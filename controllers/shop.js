
const Product = require('../models/product');

const getAllProducts = (req, res) => {
    Product.fetchAll()
        .then(products => {
            res.render('shop/product-list', 
            { 
                pageTitle: 'Shop', 
                products: products, 
                path: '/shop'
            });
    }).catch(err => console.log(err));
}

const getProductDetails = (req, res) => {
    Product.findById(req.params.productId)
        .then(product => {
            product ?
                res.render('shop/product-details.ejs', 
                { 
                    pageTitle: 'Product List', 
                    product: product, 
                    path: '/product-list'
                })
                :
                res.status(401).redirect('/');
        })
        .catch(err => console.log(err));
}

const getProductList = (req, res) => {
    Product.fetchAll()
        .then(products => {
            res.render('shop/product-list', 
            { 
                pageTitle: 'Shop | Product List', 
                products: products, 
                path: '/product-list'
            })
        })
        .catch(err => console.log(err));
}

const getShopIndex = (req, res) => {
    res.render('shop/index.ejs', 
    { 
        pageTitle: 'Shop | Index Page', 
        path: '/'
    });
}

const getCartPage = (req, res) => {
    req.user.getCart()
        .then(({ cart, total }) => {
            res.render('shop/cart', 
            { 
                pageTitle: 'Shop | Cart Page', 
                path: '/cart',
                cart: cart ? cart : null,
                total
            });
        })
        .catch(err => console.log(err));
}

const addToCart = (req, res) => {
    const { productId } = req.body;
    Product.findById(productId)
        .then(product => {
            return req.user.addToCart(product._id);
        })
        .then(() => res.redirect('/cart'))
        .catch(err => console.log(err));
} 

const deleteFromCart = (req, res) => {
    const { productId } = req.body;
    req.user.deleteFromCart(productId)
    .then(() => res.redirect('/cart'))
    .catch(err => console.log(err));
} 

const decreaseCartItemCount = (req, res) => {
    const { productId } = req.body;
    req.user.decCartItemCount(productId)
        .then(() => res.redirect('/cart'))
        .catch(err => console.log(err));
} 

const getOrdersPage = (req, res) => {
    req.user.getOrders()
        .then(orders => {
            res.render('shop/orders.ejs', 
            { 
                pageTitle: 'Shop | Orders Page', 
                path: '/orders',
                orders
            });
        })
        .catch(err => console.log(err));
}

const postOrder = (req, res) => {
    req.user.addOrder()
        .then(() => res.redirect('/orders'))
        .catch(err => console.log(err));
}

module.exports = {
    getAllProducts,
    getProductList,
    getProductDetails,
    getShopIndex,
    postOrder,
    getCartPage,
    addToCart,
    decreaseCartItemCount,
    deleteFromCart,
    getOrdersPage
}