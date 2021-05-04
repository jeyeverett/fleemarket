const { ObjectId } = require('mongodb');
const { getDb } = require('../utilities/database');
const Product = require('../models/product');

class User {
    constructor(username, email, cart, id) {
        this.name = username;
        this.email = email;
        this.cart = cart ? cart : { items: [] };
        this._id = id ? id : null;
    }

    save() {
        const db = getDb();
        return db.collection('users').insertOne(this);
    }

    
    addToCart(productId) {
        const updatedCart = { ...this.cart };
        const cartProductIndex = updatedCart.items.findIndex(item => String(item.productId) === String(productId));
        if (cartProductIndex >= 0) {
            updatedCart.items[cartProductIndex].quantity++;
        } else {
            updatedCart.items.push({ productId, quantity: 1});
        }
        
        const db = getDb();
        return db.collection('users').updateOne( { _id: ObjectId(this._id) }, 
        {
            $set: {
                cart: updatedCart
            }
        });
    }

    getCart() {
        const cartOfPromises = this.cart.items.map(item => {
            return Product.findById(item.productId)
                .then(product => {
                    return { ...product, quantity: item.quantity}
                })
                .catch(err => console.log(err));
        });
        return Promise.all(cartOfPromises)
            .then(cart => {
                const total = cart.reduce((acc, curr) => {
                    return acc + curr.quantity * Number(curr.price);
                }, 0);
                return { cart, total };
            })
            .catch(err => console.log(err));
    }
    
    deleteFromCart(productId) {
        const updatedCart = { 
            items: this.cart.items.filter(item => String(item.productId) !== String(productId))
        };
        const db = getDb();
        return db.collection('users').updateOne( { _id: ObjectId(this._id) }, 
        {
            $set: {
                cart: updatedCart
            }
        });
    }

    decCartItemCount(productId) {
        const updatedCart = { ...this.cart };
        const cartItemIndex = updatedCart.items.findIndex(item => String(item.productId) === String(productId));
        if (updatedCart.items[cartItemIndex].quantity > 1) {
            updatedCart.items[cartItemIndex].quantity--;
            const db = getDb();
            return db.collection('users').updateOne( { _id: ObjectId(this._id) }, 
            {
                $set: {
                    cart: updatedCart
                }
            });
        }

        return Promise.resolve();
    }

    addOrder() {
        const db = getDb();
        return this.getCart()
            .then(({cart, total}) => {
                return db.collection('orders')
                    .insertOne({ 
                        user: {
                            userId: this._id,
                            name: this.name,
                            email: this.email
                        }, 
                        items: cart,
                        total: total
                    });
            })
            .then(() => {
                this.cart = { items: [] };
                return db.collection('users')
                    .updateOne( { _id: ObjectId(this._id) },
                    {
                        $set: {
                            cart: { items: [] }
                        }
                    });
            })
            .catch(err => console.log(err));
    }

    getOrders() {
        const db = getDb();
        return db.collection('orders')
            .find({ "user.userId": ObjectId(this._id) })
            .toArray()
            .then(orders => {
                return orders;
            })
            .catch(err => console.log(err));
    }

    static findById(id) {
        const db = getDb();
        return db.collection('users').findOne({ _id: ObjectId(id) });
    }
}

module.exports = User;