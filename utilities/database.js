const MongoClient = require('mongodb').MongoClient;

const uri = `mongodb+srv://admin:${process.env.MONGO_PASSWORD}@cluster0.3cano.mongodb.net/shop?retryWrites=true&w=majority`;

let _db;

const mongoConnect = (callback) => {
    MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(client => {
            console.log('MongoDB connection established.');
            _db = client.db();
            callback();
        })
        .catch(err => {
            console.log('MongoDB connection failed.');
            console.log(err);
            throw err;
        });
}

const getDb = () => {
    if (_db) {
        return _db;
    }
    throw 'No database found.'
}

module.exports = { mongoConnect, getDb };

