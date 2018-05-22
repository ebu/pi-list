const passport = require('passport');
const db = require('../managers/database');
const setupLocalAuth = require('./local');
const setupFacebookOAuth = require('./facebook');
const logger = require('../util/logger');
const uuid = require('uuid/v4');
const tokenManager = require('../managers/token');
const websocket = require('../managers/websocket');
const passwordInterpreter = require('./passwordInterpreter');
const validator = require('validator');
const API_ERRORS = require('../enums/apiErrors');
const HTTP_STATUS_CODE = require('../enums/httpStatusCode');
const program = require('../util/programArguments');

module.exports = (app) => {
    app.use(passport.initialize());
    app.use(passport.session());

    setupFacebookOAuth(app);
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
        res.status(HTTP_STATUS_CODE.SUCCESS.OK).send({t: token });
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

        db.saveUser({
            email,
            password: rawPassword
        }).then((user) => {
            tokenManager.setTokenAsInvalid(token);
            return res.status(HTTP_STATUS_CODE.SUCCESS.CREATED).send(user);
        })
        .catch(() => {
            tokenManager.setTokenAsInvalid(token);
            return res.status(HTTP_STATUS_CODE.CLIENT_ERROR.BAD_REQUEST).send(API_ERRORS.USER_ALREADY_REGISTERED);
        });
    });
};
