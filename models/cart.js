const fs = require('fs');
const path = require('path');
const rootDir = require('../utilities/path');

const p = path.join(rootDir, 'data', 'cart.json');

class Cart {
    static addProduct(id, productPrice) {
        //Fetch the previous cart
        fs.readFile(p, (err, fileContent) => {
            let cart = { products: [], totalPrice: 0 }
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

            cart.totalPrice += productPrice;

            fs.writeFile(p, JSON.stringify(cart), err => err ? console.log(err) : '');
        });
    }
}

module.exports = Cart;