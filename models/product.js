const fs = require('fs');
const path = require('path');
const rootDir = require('../utilities/path');

const p = path.join(rootDir, 'data', 'products.json');

const getProductsFromFile = func => {
    fs.readFile(p, (err, fileContent) => {
        if (err) {
            return func([]);
        } 
        return func(JSON.parse(fileContent));
    });
}

class Product {
    constructor(title, price, imageUrl, description) {
        this.title = title;
        this.price = price;
        this.imageUrl = imageUrl;
        this.description = description;
        this.id = this.randomId();
    }

    save() {
        getProductsFromFile(products => {
            products.push(this);
            fs.writeFile(p, JSON.stringify(products), (err) => {
                if (err) console.log(err);
            });
        });
    }

    static fetchAll(func) {
        getProductsFromFile(func);
    }

    static findById(id, func) {
        Product.fetchAll(products => {
            const product = products.find(product => product.id === Number(id) ? product : null);
            func(product);
        });
    }

    randomId() {
        return Math.floor(Math.random() * 100);
    }
}

module.exports = Product;