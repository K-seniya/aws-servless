const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const AWS = require('aws-sdk');

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE;
const IS_OFFLINE = process.env.IS_OFFLINE;

let dynamoDb;
if (IS_OFFLINE === 'true') {
    dynamoDb = new AWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
    });
    console.log(dynamoDb);
} else {
    dynamoDb = new AWS.DynamoDB.DocumentClient();
}

app.use(bodyParser.json({ strict: false }));

app.get('/', function (req, res) {
    res.send('Hello World!')
});

// Get Product endpoint
app.get('/products/:productId', function (req, res) {
    const params = {
        TableName: PRODUCTS_TABLE,
        Key: {
            productId: req.params.productId,
        },
    };

    dynamoDb.get(params, (error, result) => {
        if (error) {
            console.log(error);
            res.status(400).json({ error: 'Could not get product' });
        }
        if (result.Item) {
            const {productId, name} = result.Item;
            res.json({ productId, name });
        } else {
            res.status(404).json({ error: "Product not found" });
        }
    });
});

// Create Product endpoint
app.post('/products', function (req, res) {
    const { productId, name } = req.body;
    if (typeof productId !== 'string') {
        res.status(400).json({ error: '"productId" must be a string' });
    } else if (typeof name !== 'string') {
        res.status(400).json({ error: '"name" must be a string' });
    }

    const params = {
        TableName: PRODUCTS_TABLE,
        Item: {
            productId: productId,
            name: name,
        },
    };

    dynamoDb.put(params, (error) => {
        if (error) {
            console.log(error);
            res.status(400).json({ error: 'Could not create product' });
        }
        res.json({ productId, name });
    });
});

module.exports.handler = serverless(app);