
const Product = require('../models/product');
const Order = require('../models/order');

const getAllProducts = (req, res) => {
    Product.find()
        .then(products => {
            res.render('shop/product-list', 
            { 
                pageTitle: 'Shop', 
                products: products, 
                path: '/shop',
                isAuthenticated: req.session.isLoggedIn,
                csrfToken: req.csrfToken()
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
                    path: '/product-list',
                    isAuthenticated: req.session.isLoggedIn,
                    csrfToken: req.csrfToken()
                })
                :
                res.status(401).redirect('/');
        })
        .catch(err => console.log(err));
}

const getProductList = (req, res) => {
    Product.find()
        .then(products => {
            res.render('shop/product-list', 
            { 
                pageTitle: 'Shop | Product List', 
                products: products, 
                path: '/product-list',
                isAuthenticated: req.session.isLoggedIn,
                csrfToken: req.csrfToken()
            })
        })
        .catch(err => console.log(err));
}

const getShopIndex = (req, res) => {
    res.render('shop/index.ejs', 
    { 
        pageTitle: 'Shop | Index Page', 
        path: '/',
        isAuthenticated: req.session.isLoggedIn,
        csrfToken: req.csrfToken()
    });
}

const getCartPage = (req, res) => {
    req.user.populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            res.render('shop/cart', 
            { 
                pageTitle: 'Shop | Cart Page', 
                path: '/cart',
                cart: user.cart.items,
                total: user.cart.items.reduce((acc, curr) => {
                    const product = curr.productId;
                    return acc + curr.quantity * product.price;
                }, 0),
                isAuthenticated: req.session.isLoggedIn,
                csrfToken: req.csrfToken()
            });
        })
        .catch(err => console.log(err));
}

const addToCart = (req, res) => {
    const { productId } = req.body;
    req.user.addToCart(productId)
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
    Order.find({ "user.userId": req.user._id })
        .then(orders => {
            res.render('shop/orders.ejs', 
            { 
                pageTitle: 'Shop | Orders Page', 
                path: '/orders',
                orders,
                isAuthenticated: req.session.isLoggedIn,
                csrfToken: req.csrfToken()
            });
        })
        .catch(err => console.log(err));
}

const postOrder = (req, res) => {
    req.user.populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items.map(item => {
                return { product: { ...item.productId._doc }, quantity: item.quantity };
            });
            const total = products.reduce((acc, curr) => {
                return acc + curr.product.price * curr.quantity;
            }, 0);

            const order = new Order({
                user: {
                    userId: req.user
                },
                products,
                total 
            });
            return order.save();
        })
        .then(() => req.user.clearCart())
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