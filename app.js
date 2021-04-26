const express = require('express');
const app = express();

const path = require('path');
app.use(express.static(path.join(__dirname, 'public'))); //Serve static assets
app.use(express.urlencoded({ extended: true })); //Parse to JSON
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

//Controllers
const { get404Error } = require('./controllers/errors')

app.use('/admin', adminRoutes);

app.use(shopRoutes);

app.use('*', get404Error);

app.listen(3000, () => {
    console.log('Server initiated on Port 3000');
});