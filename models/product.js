const { ObjectId } = require('mongodb');
const { getDb } = require('../utilities/database');
class Product {
    constructor(title, price, description, imageUrl, userId) {
        this.title = title;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this.userId = userId;
    }

    save() {
        const db = getDb();
        return db.collection('products').insertOne(this);
    }

    static fetchAll() {
        const db = getDb();
        return db.collection('products')
            .find() //By default mongo will return a handler to products which allows us to step through them 1x1
            .toArray() //We use this instead of the handler (this should only be used if we are getting < 100 products)
            .then(products => {
                return products;
            })
            .catch(err => console.log(err));
    }

    static findById(id) {
        const db = getDb();
        return db.collection('products')
            .findOne({ _id: ObjectId(id) });
    }

    static update(updatedProduct) {
        const db = getDb();
        return db.collection('products').updateOne({ _id: ObjectId(updatedProduct.id) }, 
            {
                $set: {
                    "title": updatedProduct.title,
                    "price": updatedProduct.price,
                    "description": updatedProduct.description,
                    "imageUrl": updatedProduct.imageUrl
                }
            })
            .catch(err => console.log(err));
    }

    static deleteById(id) {
        const db = getDb();
        return db.collection('products').deleteOne({ _id: ObjectId(id) })
            .then(() => {
                console.log(ObjectId(id));
                return db.collection('users').updateMany({ "cart.items.productId": ObjectId(id) },
                {
                    $pull: { "cart.items": 
                        { 
                            "productId": ObjectId(id) 
                        } 
                    }
                });
            }) 
            .catch(err => console.log(err));
    }
}

module.exports = Product;