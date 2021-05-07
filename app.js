// Node
const path = require('path');
const express = require('express');
const app = express();

// Express setup
app.use(express.static(path.join(__dirname, 'public'))); //Serve static assets
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
const store = new MongoDBStore({
    uri: process.env.MONGO_URI,
    collection: 'sessions'
}, err => err ? console.log(err) : '');
store.on('error', err => console.log(err));

// Models
const User = require('./models/user');

//Controllers
const { get404Error } = require('./controllers/errors');

//Routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

// UX
const flash = require('connect-flash');

// Middleware
app.use(session(
    { 
        secret: 'thisshouldbealongsecretstring', 
        resave: false, 
        saveUninitialized: false,
        store: store
    } 
));

app.use(csrfProtect);
app.use(flash());

app.use((req, res, next) => {
    if (!req.session.userId) return next();

    User.findById(req.session.userId.toString())
    .then(user => {
        req.user = user;
        next();
    })
    .catch(err => console.log(err));
});

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    res.locals.successMessage = req.flash('success');
    res.locals.errorMessage = req.flash('error');
    next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use('*', get404Error);

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => app.listen(3000, () => console.log('Server initiated on Port 3000 - MongoDB Connected')))
    .catch(err => console.log('Database connection failed.', err));

   

