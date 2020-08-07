const jwt = require('jsonwebtoken');
const logger = require('../util/logger');
const config = require('./options');
const HTTP_STATUS_CODE = require('../enums/httpStatusCode');
const collection = require('../models/user');
const websocket = require('../managers/websocket');
const crypto = require('crypto');
const uuidv1 = require('uuid/v1');

const defaultPreferences = {
    gui: {
        theme: 'dark',
        language: 'en-US',
    },
    analysis: {
        currentProfileId: null,
    },
};

const getUsername = (req) => {
    const token = getToken(req);
    if (token) {
        const username = jwt.verify(token, config.secret, (err, decoded) => {
            if (err === null) {
                return decoded.username;
            } else {
                return undefined;
            }
        });
        return username;
    } else {
        return undefined;
    }
};

const getUserId = (req) => {
    const token = getToken(req);
    if (token) {
        const id = jwt.verify(token, config.secret, (err, decoded) => {
            if (err === null) {
                return decoded.id;
            } else {
                return undefined;
            }
        });
        return id;
    } else {
        return undefined;
    }
};

const getTokenFromHeaderOrQuery = (req) => {
    const token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
    if (token) return token;

    // If it is not on the headers, maybe it is on a query parameter
    return req.query.token;
};

const getToken = (req) => {
    const token = getTokenFromHeaderOrQuery(req);
    if (token && token.startsWith('Bearer ')) {
        // Remove Bearer from string
        return token.slice(7, token.length);
    }

    return null;
};

const checkToken = (req, res, next) => {
    const token = getToken(req);

    if (token) {
        jwt.verify(token, config.secret, (err, decoded) => {
            if (err) {
                logger('auth').info('Invalid token');

                res.status(HTTP_STATUS_CODE.CLIENT_ERROR.UNAUTHORIZED).send({ success: false });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        logger('auth').info('No token');
        res.status(HTTP_STATUS_CODE.CLIENT_ERROR.UNAUTHORIZED).send({ success: false });
    }
};

function authenticate(plainPassword, salt, password, unsecure) {
    if (unsecure) return plainPassword === password;

    return crypto.createHmac('sha512', salt).update(plainPassword).digest('base64').toString() === password;
}

const handleLogin = (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const unsecure = req.body.unsecure;

    collection
        .findOne({ username: username })
        .exec()
        .then((user) => {
            if (user) {
                if (authenticate(password, user.salt, user.password, unsecure)) {
                    const token = jwt.sign({ username: username, id: user.id }, config.secret, {
                        expiresIn: '24h', // expires in 24 hours
                    });

                    // return the JWT token for the future API calls
                    res.status(HTTP_STATUS_CODE.SUCCESS.OK).send({
                        result: 0,
                        desc: 'Authentication successful',
                        content: { success: true, token: token },
                    });
                    return;
                } else {
                    res.status(HTTP_STATUS_CODE.SUCCESS.OK).send({
                        result: HTTP_STATUS_CODE.CLIENT_ERROR.UNAUTHORIZED,
                        desc: 'Unauthorized Access',
                        content: { success: false, token: null },
                    });
                    return;
                }
            }

            res.status(HTTP_STATUS_CODE.SUCCESS.OK).send({
                result: HTTP_STATUS_CODE.CLIENT_ERROR.UNAUTHORIZED,
                desc: 'Unauthorized Access',
                content: { success: false, token: null },
            });
            return;
        })
        .catch(() => {
            res.status(HTTP_STATUS_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR).send({
                result: HTTP_STATUS_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR,
                desc: `Failed to read user from the Database.`,
                content: 0,
            });
        });
};

const handleLogout = (req, res) => {
    //websocket.instance().disconnectSession(req.body.socketid);
    res.status(HTTP_STATUS_CODE.SUCCESS.OK).send({
        success: true,
        message: 'Logout successful!',
    });
};

/* Salt and Encrypt password */

function generateSalt() {
    var buf = crypto.randomBytes(16);
    return buf.toString('base64');
}

function encodePassword(password, salt) {
    return crypto.createHmac('sha512', salt).update(password).digest('base64').toString();
}

/*

*/
const handleRegister = (req, res) => {
    let user = req.body;

    user.salt = generateSalt();
    user.password = encodePassword(user.password, user.salt);
    user.preferences = defaultPreferences;

    if (user.id === undefined) {
        user.id = uuidv1();
    }

    collection
        .create(user)
        .then(function (data) {
            res.status(HTTP_STATUS_CODE.SUCCESS.CREATED).send(data);
        })
        .catch(function (err) {
            res.status(HTTP_STATUS_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(err.message);
        });
};

module.exports = {
    defaultPreferences,
    checkToken,
    getUserId,
    getUsername,
    handleLogin,
    handleLogout,
    handleRegister,
    authenticate,
    generateSalt,
    encodePassword,
};
