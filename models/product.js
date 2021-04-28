const db = require('../utilities/database');

class Product {
    constructor(title, price, imageUrl, description, id) {
        this.title = title;
        this.price = price;
        this.imageUrl = imageUrl;
        this.description = description;
        this.id = id; //Id is null for newly created products because we set the id in the "save" method below
    }

    save() {
        return db.execute(`INSERT INTO products (title, price, description, imageUrl) VALUES (?, ?, ?, ?)`, 
        [
            this.title, this.price, this.description, this.imageUrl
        ]);
    }

    static fetchAll() {
        return db.execute('SELECT * FROM products');
    }

    static findById(id) {
        return db.execute(`SELECT * FROM products WHERE id = ?`, [id]);
    }

    static findByIdAndDelete(id) {

    }
}

module.exports = Product;