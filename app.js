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
const sequelize = require('./utilities/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

//Routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

//Controllers
const { get404Error } = require('./controllers/errors');

// Middleware
app.use((req, res, next) => {
    User.findByPk(1)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);

app.use(shopRoutes);

app.use('*', get404Error);

// SQL Associations
Product.belongsTo(User, {
    constraints: true,
    onDelete: 'CASCADE'
});
User.hasMany(Product);
User.hasOne(Cart);
User.hasMany(Order);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Order.belongsTo(User);
Order.belongsToMany(Product, { through: OrderItem });

sequelize.sync()
    .then(() => {
        return User.findByPk(1);
    })
    .then(user => {
        if (!user) {
            return User.create({ name: 'Jeysen', email: 'test@test.com' });
        }
        return user; //Note that user is automatically wrapped in a Promise when returned in a .then block (otherwise we would need to use Promise.resolve(user))
    })
    .then(user => {
        return user.getCart()
            .then(cart => {
                if (!cart) {
                    return user.createCart();
                }
            }).catch(err => console.log(err));
    })
    .then(() => {
        app.listen(3000, () => {
            console.log('Server initiated on Port 3000 - Database initiated on Port 3306');
        });
    })
    .catch(err => console.log(err));