const { validationResult } = require('express-validator');
const { deleteFile } = require('../utilities/file');

// Models
const Product = require('../models/product');

const ITEMS_PER_PAGE = 8;

// READ
const getProducts = (req, res, next) => {
  const page = req.query.page ? Number(req.query.page) : 1;
  let totalItems;
  Product.find({ 'owner.userId': req.session.userId })
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find({ 'owner.userId': req.session.userId })
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render('admin/admin-products', {
        pageTitle: 'Admin | Products',
        products: products,
        path: '/admin/admin-products',
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
    .catch(() => {
      const error = new Error('Failed to create new product.');
      error.httpStatusCode = 500;
      return next(error);
    });
};

// CREATE
const getProductAdd = (req, res) => {
  res.render('admin/edit-product', {
    pageTitle: 'Admin | Add Product',
    path: '/admin/add-product',
    edit: false,
    validationErrors: [],
    input: { title: null, price: null, imageUrl: null, description: null },
  });
};

const postProductAdd = (req, res, next) => {
  const { title, price, description } = req.body;
  const image = req.file;
  const errors = validationResult(req);

  if (!image) {
    res.locals.errorMessage = [
      { msg: 'Attached file must be an image in .png or .jpg format.' },
    ];
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Admin | Add Product',
      path: '/admin/add-product',
      edit: false,
      validationErrors: [],
      input: { title, price, description },
    });
  }

  if (!errors.isEmpty()) {
    deleteFile(image.path);
    res.locals.errorMessage = errors.array();
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Admin | Add Product',
      path: '/admin/add-product',
      edit: false,
      validationErrors: errors.array(),
      input: { title, price, description },
    });
  }

  const imageUrl = image.path;

  const product = new Product({
    title,
    price,
    description,
    imageUrl,
    owner: { userId: req.user._id, name: req.user.sellerName },
  });
  product
    .save()
    .then(() => res.redirect('/admin/admin-products'))
    .catch((err) => {
      const error = new Error('Failed to create new product.');
      error.httpStatusCode = 500;
      return next(error);
    });
};

// UPDATE
const getProductEdit = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    req.flash(
      'error',
      'You are not authorized to access this page. If this is your product, please login.'
    );
    return res.redirect('/');
  }
  const productId = req.params.productId;
  Product.findById(productId)
    .then((product) => {
      product
        ? res.render('admin/edit-product.ejs', {
            pageTitle: 'Admin | Edit Product',
            path: '/admin/edit-product',
            edit: editMode,
            product,
            validationErrors: [],
            input: null,
          })
        : res.status(401).redirect('/'); //Change later to redirect to error page
    })
    .catch(() => {
      const error = new Error('Failed to create new product.');
      error.httpStatusCode = 500;
      return next(error);
    });
};

const postProductEdit = (req, res, next) => {
  const { title, price, description, id } = req.body;
  const image = req.file;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.locals.errorMessage = errors.array();
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Admin | Edit Product',
      path: '/admin/edit-product',
      edit: true,
      validationErrors: errors.array(),
      input: { title, price, description },
    });
  }

  Product.findById(id)
    .then((product) => {
      if (product.userId.toString() !== req.session.userId.toString()) {
        req.flash('error', 'You are not authorized to edit this product.');
        return res.redirect('/');
      }
      product.title = title;
      product.price = price;
      product.description = description;
      if (image) {
        deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }
      return product.save();
    })
    .then(() => res.redirect('/admin/admin-products'))
    .catch((err) => {
      console.log(err);
      const error = new Error('Failed to update product, please try again.');
      error.httpStatusCode = 500;
      return next(error);
    });
};

// DELETE
const deleteProduct = (req, res, next) => {
  const id = req.params.productId;
  const imageUrl = req.query.imageUrl;
  deleteFile(imageUrl);
  Product.deleteOne({ _id: id, userId: req.session.userId })
    .then(() => req.user.deleteFromCart(id))
    .then(() => res.status(200).json({ message: 'Success.' }))
    .catch(() => {
      res.status(500).json({ message: 'Product deletion failed.' });
    });
};

module.exports = {
  getProductAdd,
  postProductAdd,
  getProducts,
  getProductEdit,
  postProductEdit,
  deleteProduct,
};
