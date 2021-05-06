const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    cart: {
        items: [{
            productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true }
        }]
    }
});

userSchema.methods.addToCart = function(productId) {
    const updatedCart = { ...this.cart };
    const cartProductIndex = updatedCart.items.findIndex(item => String(item.productId) === String(productId));
    if (cartProductIndex >= 0) {
        updatedCart.items[cartProductIndex].quantity++;
    } else {
        updatedCart.items.push({ productId, quantity: 1});
    }
    
    this.cart = updatedCart;
    return this.save();
}

userSchema.methods.deleteFromCart = function(productId) {
    const updatedCart = { 
        items: this.cart.items.filter(item => String(item.productId) !== String(productId))
    };
    this.cart = updatedCart;
    return this.save();
}

userSchema.methods.decCartItemCount = function(productId) {
    const updatedCart = { ...this.cart };
    const cartItemIndex = updatedCart.items.findIndex(item => String(item.productId) === String(productId));
    if (updatedCart.items[cartItemIndex].quantity > 1) {
        updatedCart.items[cartItemIndex].quantity--;
        this.cart = updatedCart;
        return this.save();
    }
    return Promise.resolve();
}

userSchema.methods.clearCart = function() {
    this.cart = { items: [] };
    return this.save();
}

module.exports = mongoose.model('User', userSchema);
