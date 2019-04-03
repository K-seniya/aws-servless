const jwt = require('jsonwebtoken');
const AUTH0_CLIENT_PUBLIC_KEY = process.env.AUTH0_CLIENT_PUBLIC_KEY;
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;

/*
 * Functions
 */

// Reusable Authorizer function, set on `authorizer` field in serverless.yml
module.exports.auth = (event, context, callback) => {
    if (!event.authorizationToken) {
        return callback('Unauthorized');
    }

    const tokenParts = event.authorizationToken.split(' ');
    const tokenValue = tokenParts[1];

    if (!(tokenParts[0].toLowerCase() === 'bearer' && tokenValue)) {
        // no auth token!
        return callback('Unauthorized');
    }
    const options = {
        audience: AUTH0_CLIENT_ID,
    };

    try {
        jwt.verify(tokenValue, AUTH0_CLIENT_PUBLIC_KEY, options, (verifyError, decoded) => {
            if (verifyError) {
                console.log('verifyError', verifyError);
                // 401 Unauthorized
                console.log(`Token invalid. ${verifyError}`);
                return callback('Unauthorized');
            }
            // is custom authorizer function
            console.log('valid from customAuthorizer', decoded);
            return callback(null, generatePolicy(decoded.sub, 'Allow', event.methodArn));
        });
    } catch (err) {
        console.log('catch error. Invalid token', err);
        return callback('Unauthorized');
    }
};

/*
 * Helpers
 */

// Policy helper function
const generatePolicy = (principalId, effect, resource) => {
    const authResponse = {};
    authResponse.principalId = principalId;
    if (effect && resource) {
        const policyDocument = {};
        policyDocument.Version = '2019-04-02';
        policyDocument.Statement = [];
        const statementOne = {};
        statementOne.Action = 'execute-api:Invoke';
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }
    console.log("authResponse: " + {... authResponse});
    return authResponse;
};