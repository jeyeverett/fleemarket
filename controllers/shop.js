
const Product = require('../models/product');
const Cart = require('../models/cart');

const getAllProducts = (req, res) => {
    Product.fetchAll(products => {
        res.render('shop/product-list', 
        { 
            pageTitle: 'Shop', 
            products, 
            path: '/shop'
        });
    });
}

const getProductDetails = (req, res) => {
    Product.findById(req.params.productId, product => {
        if (product) {
            return res.render('shop/product-details.ejs', 
            { 
                pageTitle: 'Product List', 
                product, 
                path: '/product-list'
            });
        }
        res.redirect('/');
    });
}

const getProductList = (req, res) => {
    Product.fetchAll(products => {
        res.render('shop/product-list', 
        { 
            pageTitle: 'Shop | Product List', 
            products, 
            path: '/product-list'
        });
    });
}

const getShopIndex = (req, res) => {
    res.render('shop/index.ejs', 
    { 
        pageTitle: 'Shop | Index Page', 
        path: '/'
    });
}

const getCheckoutPage = (req, res) => {
    res.render('shop/checkout.ejs', 
    { 
        pageTitle: 'Shop | Checkout Page', 
        path: '/checkout'
    });
}

const getCartPage = (req, res) => {
    Cart.fetchAll(cart => {
        Product.fetchAll(products => {
            const cartProducts = [];
            for (let product of products) {
                const cartProductData = cart.products.find(item => item.id === product.id);
                if (cartProductData) {
                    cartProducts.push({ ...product, qty: cartProductData.qty });
                }
            }
            res.render('shop/cart', 
            { 
                pageTitle: 'Shop | Cart Page', 
                path: '/cart',
                cartProducts,
                totalPrice: cart.totalPrice
            });
        });
    })
}

const addToCart = (req, res) => {
    const productId = req.body.productId;
    Product.findById(productId, product => {
        Cart.addProduct(productId, Number(product.price));
    });
    res.redirect('/cart');
} 

const deleteFromCart = (req, res) => {
    const { productId } = req.body;
    Product.findById(productId, product => {
        Cart.deleteProduct(productId, product.price, () => res.redirect('/cart'));
    });
} 

const getOrdersPage = (req, res) => {
    res.render('shop/orders.ejs', 
    { 
        pageTitle: 'Shop | Orders Page', 
        path: '/orders'
    });
}

module.exports = {
    getAllProducts,
    getProductList,
    getProductDetails,
    getShopIndex,
    getCheckoutPage,
    getCartPage,
    addToCart,
    deleteFromCart,
    getOrdersPage
}