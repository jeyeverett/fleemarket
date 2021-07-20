// Node
const path = require('path');
const express = require('express');
const app = express();

// Express setup
app.use(express.static(path.join(__dirname, 'public'))); //Serve static assets
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.urlencoded({ extended: true })); //Parse to JSON
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Security
const csrf = require('csurf');
const csrfProtect = csrf();

//Database
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const store = new MongoDBStore(
  {
    uri: process.env.MONGO_URI,
    collection: 'sessions',
  },
  (err) => (err ? console.log(err) : '')
);
store.on('error', (err) => console.log(err));

// Models
const User = require('./models/user');

//Controllers
const { getError404 } = require('./controllers/errors');

//Routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

// Middleware
const flash = require('connect-flash');
const multer = require('multer');
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(
  session({
    secret: 'thisshouldbealongsecretstring',
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(multer({ storage: fileStorage, fileFilter }).single('image'));
app.use(csrfProtect);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  res.locals.successMessage = req.flash('success');
  res.locals.errorMessage = req.flash('error');
  next();
});

app.use((req, res, next) => {
  if (!req.session.userId) return next();
  User.findById(req.session.userId.toString())
    .then((user) => {
      if (!user) return next();
      req.user = user;
      next();
    })
    .catch(() => {
      const error = new Error('Failed to find user.');
      error.httpStatusCode = 500;
      return next(error);
    });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use('*', getError404);

app.use((error, req, res, next) => {
  return res.status(500).render('500', {
    pageTitle: 'Error 500 | Server-Side Error',
    path: '500',
    errorMsg: error,
  });
});

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    app.listen(3000, () =>
      console.log('Server initiated on Port 3000 - MongoDB Connected')
    )
  )
  .catch((err) => console.log('Database connection failed.', err));
