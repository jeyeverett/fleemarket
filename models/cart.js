const fs = require('fs');
const path = require('path');
const rootDir = require('../utilities/path');

const p = path.join(rootDir, 'data', 'cart.json');

const getProductsFromFile = func => {
    fs.readFile(p, (err, fileContent) => {
        if (err) {
            return func(null);
        } 
        return func(JSON.parse(fileContent));
    });
}
class Cart {
    static addProduct(id, productPrice) {
        //Fetch the previous cart
        fs.readFile(p, (err, fileContent) => {
            let cart = { products: [], totalPrice: 0 };
            if (!err) {
                cart = JSON.parse(fileContent);
            }
            //Analyze the cart, find existing product
            const index = cart.products.findIndex(product => product.id === id);
            //Add new product or increase the quantity
            (index !== -1) ? 
                cart.products[index].qty++ 
                : 
                cart.products = [...cart.products, { id, qty: 1 }];

            cart.totalPrice += +productPrice.toFixed(2);

            fs.writeFile(p, JSON.stringify(cart), err => err ? console.log(err) : '');
        });
    }

    static deleteProduct(id, productPrice, func) {
        fs.readFile(p, (err, fileContent) => {
            if (err) return;
            const cart = JSON.parse(fileContent);
            const index = cart.products.findIndex(item => item.id === id); //Find the index of the product we want to delete
            if (index === -1) return;
            const updatedCart = { ...cart }; //Copy the existing cart
            updatedCart.products = cart.products.filter(item => item.id !== id); //Filter the existing cart, removing the product we want to delete
            updatedCart.totalPrice = +(cart.totalPrice - cart.products[index].qty * productPrice).toFixed(2); 
            fs.writeFile(p, JSON.stringify(updatedCart), err => err ? console.log(err) : '');
            func();
        });
    }

    static fetchAll(func) {
        getProductsFromFile(func);
    }
}

module.exports = Cart;