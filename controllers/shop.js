
const Product = require('../models/product');

const getAllProducts = (req, res) => {
    Product.fetchAll()
        .then(([products]) => {
            res.render('shop/product-list', 
            { 
                pageTitle: 'Shop', 
                products: products, 
                path: '/shop'
            });
    }).catch(err => console.log(err));
}

const getProductDetails = (req, res) => {
    Product.findByPk(req.params.productId)
        .then(product => {
            product.dataValues ?
                res.render('shop/product-details.ejs', 
                { 
                    pageTitle: 'Product List', 
                    product: product.dataValues, 
                    path: '/product-list'
                })
                :
                res.status(401).redirect('/');
        })
        .catch(err => console.log(err));
}

const getProductList = (req, res) => {
    Product.findAll()
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
    req.user.getOrders().then(orders => {
        req.user.getCart()
        .then(cart => cart.getProducts())
        .then(cartProducts => {
                res.render('shop/cart', 
                { 
                    pageTitle: 'Shop | Cart Page', 
                    path: '/cart',
                    cartProducts,
                    orders: orders.length ? true : false
                });
            })
            .catch(err => console.log(err));
    })
}

const addToCart = (req, res) => {
    const { productId } = req.body;
    let fetchedCart;
    let newQuantity = 1;
    req.user.getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts({ where: { id: productId } });
        })
        .then(products => {
            let product;
            if (products.length) {
                product = products[0];
            }
            if (product) {
                 const oldQuantity = product.cartItem.quantity;
                 newQuantity = oldQuantity + 1;
                 return product;
            }
            return Product.findByPk(productId);
        })
        .then(product => fetchedCart.addProduct(product, { through: { quantity: newQuantity } }))
        .then(() => res.redirect('/cart'))
        .catch(err => console.log(err));
} 

const decreaseCartCount = (req, res) => {
    const { productId } = req.body;
    let fetchedCart;
    let newQuantity = 1;
    req.user.getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts({ where: { id: productId } });
        })
        .then(products => {
            let product;
            if (products.length) {
                product = products[0];
            }
            if (product.cartItem.quantity > 1) {
                 const oldQuantity = product.cartItem.quantity;
                 newQuantity = oldQuantity - 1;
                 return product;
            }
            return Product.findByPk(productId);
        })
        .then(product => fetchedCart.addProduct(product, { through: { quantity: newQuantity } }))
        .then(() => res.redirect('/cart'))
        .catch(err => console.log(err));
} 

const deleteFromCart = (req, res) => {
    const { productId } = req.body;
    req.user.getCart()
        .then(cart => {
            return cart.getProducts({ where: { id: productId } });
        })
        .then(products => {
            return products[0].cartItem.destroy();
        })
        .then(() => res.redirect('/cart'))
        .catch(err => console.log(err));
} 

const getOrdersPage = (req, res) => {
    req.user.getOrders({ include: ['products']})
        .then(orders => {
            res.render('shop/orders.ejs', 
            { 
                pageTitle: 'Shop | Orders Page', 
                path: '/orders',
                orders: orders
            });
        })
        .catch(err => console.log(err));
}

const postOrder = (req, res) => {
    let fetchedCart;
    req.user.getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts();
        })
        .then(products => {
            //Because our user is associated with its order we can use it to create an order
            return req.user.createOrder()
                // Next we want to add our products to our order, but first we need to add some information
                .then(order => { 
                    return order.addProducts(
                        // We need to map through the products array and add the product quantity from the cart
                        products.map(product => {
                            product.orderItem = { quantity: product.cartItem.quantity };
                            return product;
                        })
                    );
                })
                .catch(err => console.log(err));
        })
        .then(() => {
            return fetchedCart.setProducts(null);
        })
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
    decreaseCartCount,
    deleteFromCart,
    getOrdersPage
}