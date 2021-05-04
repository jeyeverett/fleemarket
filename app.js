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

//Database
const { mongoConnect } = require('./utilities/database');
const User = require('./models/user');

//Routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

//Controllers
const { get404Error } = require('./controllers/errors');

// Middleware
app.use((req, res, next) => {
    User.findById('609146b28b86cddecd497ff1')
        .then(user => {
            req.user = new User(user.name, user.email, user.cart, user._id);
            next();
        })
        .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use('*', get404Error);

mongoConnect(() => {
    app.listen(3000, () => console.log('Server initiated on Port 3000'));
});

