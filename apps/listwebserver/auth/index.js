const passport = require('passport');
const bcrypt = require('bcrypt');
const setupLocalAuth = require('./local');
const logger = require('../util/logger');
const uuid = require('uuid/v4');
const tokenManager = require('../managers/token');
const websocket = require('../managers/websocket');
const passwordInterpreter = require('./passwordInterpreter');
const validator = require('validator');
const API_ERRORS = require('../enums/apiErrors');
const HTTP_STATUS_CODE = require('../enums/httpStatusCode');
const program = require('../util/programArguments');
const User = require('../models/user');
const { promisify } = require('util');

const bcryptHash = promisify(bcrypt.hash);

module.exports = (app) => {
    app.use(passport.initialize());
    app.use(passport.session());

    setupLocalAuth(app);

    app.get('/auth/logout', (req, res) => {
        websocket.instance().disconnectUser(req.session.passport.user.id);
        req.logout();
        res.redirect(program.webappDomain);
    });

    app.get('/auth/token', (req, res) => {
        const token = uuid().replace(/-/g, '');

        tokenManager.storeToken(token);

        logger('auth-token').info(`Set token ${token} for the session ${req.session.id}`);
        res.status(HTTP_STATUS_CODE.SUCCESS.OK).send({ t: token });
    });

    app.post('/user/register', (req, res) => {
        const { email, password } = req.body;

        const { rawPassword, token } = passwordInterpreter(password);

        if (!validator.isEmail(email)) {
            return res.status(HTTP_STATUS_CODE.CLIENT_ERROR.BAD_REQUEST)
                .send(API_ERRORS.USER_REGISTRATION_INVALID_EMAIL);
        }

        if (!tokenManager.isValidToken(token)) {
            tokenManager.setTokenAsInvalid(token);
            return res.status(HTTP_STATUS_CODE.CLIENT_ERROR.BAD_REQUEST).send(API_ERRORS.TOKEN_EXPIRED);
        }

        bcryptHash(rawPassword, 10)
            .then((hash) => {
                User.create({
                    email,
                    password: hash
                }).then((user) => {
                    tokenManager.setTokenAsInvalid(token);
                    return res.status(HTTP_STATUS_CODE.SUCCESS.CREATED).send(user);
                })
            })
            .catch(() => {
                tokenManager.setTokenAsInvalid(token);
                return res.status(HTTP_STATUS_CODE.CLIENT_ERROR.BAD_REQUEST).send(API_ERRORS.USER_ALREADY_REGISTERED);
            });
    });
};
