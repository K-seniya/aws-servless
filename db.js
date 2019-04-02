const mongoose = require('mongoose');
let isConnected;

module.exports = connectToDatabase = () => {


    if (isConnected) {
        console.log('=> using existing database connection');
        return Promise.resolve();
    }

    console.log('=> using new database connection');
    return mongoose.connect("mongodb://localhost:27017/users")
        .then(db => {
            isConnected = db.connections[0].readyState;
            return Promise.resolve();
        })
        .catch(err => ({
            statusCode: err.statusCode || 500,
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ message: err.message })
        }));
};


