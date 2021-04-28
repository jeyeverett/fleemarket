const fs = require('fs');
const path = require('path');
const rootDir = require('../utilities/path');
const Cart = require('./cart');

const p = path.join(rootDir, 'data', 'products.json');

const getProductsFromFile = func => {
    fs.readFile(p, (err, fileContent) => {
        if (err) {
            return func([]);
        } 
        return func(JSON.parse(fileContent));
    });
}

const writeProductsToFile = products => {
    fs.writeFile(p, JSON.stringify(products), (err) => {
        if (err) console.log(err);
    });
}

const randomId = () => {
    return Math.floor(Math.random() * 100);
}

class Product {
    constructor(title, price, imageUrl, description, id) {
        this.title = title;
        this.price = price;
        this.imageUrl = imageUrl;
        this.description = description;
        this.id = id; //Id is null for newly created products because we set the id in the "save" method below
    }

    save() {
        getProductsFromFile(products => {
            if (this.id) { //If we are updating an existing product
                const index = products.findIndex(product => product.id === this.id);
                const updatedProducts = [...products];
                updatedProducts[index] = this;
                writeProductsToFile(updatedProducts);
            } else {
                this.id = randomId().toString(); //we assign an id here
                products.push(this);
                writeProductsToFile(products);
            }
        });
    }

    static fetchAll(func) {
        getProductsFromFile(func);
    }

    static findById(id, func) {
        Product.fetchAll(products => {
            const product = products.find(product => product.id === id ? product : null);
            func(product);
        });
    }

    static findByIdAndDelete(id, func) {
        getProductsFromFile(products => {
            const product = products.find(product => product.id === id);
            const updatedProducts = products.filter(product => product.id !== id );
            writeProductsToFile(updatedProducts);
            Cart.deleteProduct(id, product.price);
            func(updatedProducts);
        });
    }
}

module.exports = Product;