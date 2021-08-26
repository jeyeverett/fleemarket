const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Models
const Product = require('../models/product');
const Order = require('../models/order');

const ITEMS_PER_PAGE = 8;

const getAllProducts = (req, res, next) => {
  const page = req.query.page ? Number(req.query.page) : 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render('shop/product-list', {
        pageTitle: 'Shop',
        products: products,
        path: '/shop',
        pageInfo: {
          currentPage: page,
          hasNextPage: ITEMS_PER_PAGE * page < totalItems,
          hasPrevPage: page > 1,
          nextPage: page + 1,
          prevPage: page - 1,
          lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
        },
      });
    })
    .catch((err) => next(err));
};

const getProductDetails = (req, res, next) => {
  Product.findById(req.params.productId)
    .then((product) => {
      product
        ? res.render('shop/product-details.ejs', {
            pageTitle: 'Product List',
            product: product,
            path: '/product-list',
          })
        : res.status(401).redirect('/');
    })
    .catch((err) => next(err));
};

const getShopIndex = (req, res) => {
  res.render('shop/index.ejs', {
    pageTitle: 'Shop | Index Page',
    path: '/',
  });
};

const getCartPage = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then((user) => {
      res.render('shop/cart', {
        pageTitle: 'Shop | Cart Page',
        path: '/cart',
        cart: user.cart.items,
        total: user.cart.items.reduce((acc, curr) => {
          const product = curr.productId;
          return acc + curr.quantity * product.price;
        }, 0),
      });
    })
    .catch((err) => next(err));
};

const addToCart = (req, res, next) => {
  const { productId } = req.body;
  req.user
    .addToCart(productId)
    .then(() => res.redirect('/cart'))
    .catch((err) => next(err));
};

const deleteFromCart = (req, res, next) => {
  const { productId } = req.body;
  req.user
    .deleteFromCart(productId)
    .then(() => res.redirect('/cart'))
    .catch((err) => next(err));
};

const decreaseCartItemCount = (req, res, next) => {
  const { productId } = req.body;
  req.user
    .decCartItemCount(productId)
    .then(() => res.redirect('/cart'))
    .catch((err) => next(err));
};

const getCheckoutPage = (req, res, next) => {
  let cart;
  let total = 0;
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then((user) => {
      cart = user.cart.items;
      total = user.cart.items.reduce((acc, curr) => {
        const product = curr.productId;
        return acc + curr.quantity * product.price;
      }, 0);

      return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: cart.map((product) => {
          return {
            name: product.productId.title,
            description: product.productId.description,
            amount: product.productId.price * 100,
            currency: 'usd',
            quantity: product.quantity,
          };
        }),
        success_url: `${req.protocol}://${req.get('host')}/checkout/success`,
        cancel_url: `${req.protocol}://${req.get('host')}/checkout/cancel`,
      });
    })
    .then((session) => {
      res.render('shop/checkout', {
        pageTitle: 'Shop | Checkout Page',
        path: '/checkout',
        cart,
        total,
        sessionId: session.id,
      });
    })
    .catch((err) => next(err));
};

const getOrdersPage = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then((orders) => {
      res.render('shop/orders.ejs', {
        pageTitle: 'Shop | Orders Page',
        path: '/orders',
        orders,
      });
    })
    .catch((err) => next(err));
};

const getCheckoutSuccess = (req, res, next) => {
  if (res.locals.csrfToken === '') return res.redirect('/orders');
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then((user) => {
      const products = user.cart.items.map((item) => {
        return { product: { ...item.productId._doc }, quantity: item.quantity };
      });
      const total = products.reduce((acc, curr) => {
        return acc + curr.product.price * curr.quantity;
      }, 0);

      const order = new Order({
        user: {
          userId: req.user,
        },
        products,
        total,
      });
      return order.save();
    })
    .then(() => req.user.clearCart())
    .then(() => res.redirect('/orders'))
    .catch((err) => next(err));
};

const getInvoice = (req, res, next) => {
  const { orderId } = req.params;
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error('No order found.'));
      }
      if (String(order.user.userId) !== String(req.user._id)) {
        return next(new Error('You are not authorized to access this.'));
      }
      const invoiceName = `invoice-${orderId}.pdf`;
      const invoicePath = path.join('data', 'invoices', invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${invoiceName}"`);
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(18).text('Invoice');
      pdfDoc.text(' ');
      order.products.forEach((item) => {
        pdfDoc
          .fontSize(12)
          .text(
            `${item.product.title} x ${item.quantity} x $${item.product.price}`
          );
      });
      pdfDoc.text(' ');
      pdfDoc.text(`Total: $${order.total}`);
      pdfDoc.end();
    })
    .catch((err) => next(err));
};

module.exports = {
  getAllProducts,
  getProductDetails,
  getShopIndex,
  getCheckoutSuccess,
  getCartPage,
  addToCart,
  decreaseCartItemCount,
  deleteFromCart,
  getOrdersPage,
  getInvoice,
  getCheckoutPage,
};
