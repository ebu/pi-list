const passport = require('passport');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;
const passwordInterpreter = require('./passwordInterpreter');
const tokenManager = require('../managers/token');
const API_ERRORS = require('../enums/apiErrors');
const HTTP_STATUS_CODE = require('../enums/httpStatusCode');
const logger= require('../util/logger');
const User = require('../models/user');

module.exports = (app) => {
    passport.use(
        new LocalStrategy({
            usernameField: 'email'
        }, function (username, password, done) {
            const { rawPassword, token } = passwordInterpreter(password);

            if (!tokenManager.isValidToken(token)) {
                done(null, false, API_ERRORS.TOKEN_EXPIRED);
                tokenManager.setTokenAsInvalid(token);
            } else {
                User.findOne({ email: username })
                    .then(user => {
                        bcrypt.compare(rawPassword, user.password)
                            .then((res) => {
                                if (res) {
                                    logger('local-auth').info(`Found a user with ${user.email} email address.`);
                                    tokenManager.setTokenAsInvalid(token);
                                    done(null, user.toJSON());
                                } else {
                                    logger('local-auth').error(
                                        `Mismatch password for the user with ${user.email} email address.`
                                    );
                                    tokenManager.setTokenAsInvalid(token);
                                    done(null, false, API_ERRORS.INVALID_CREDENTIALS);
                                }

                            });
                    })
                    .catch((err) => {
                        logger('local-auth').error(`Unable to run the findUserByEmail command. Error: ${err}`);
                        tokenManager.setTokenAsInvalid(token);
                        done(null, false, API_ERRORS.USER_DOES_NOT_EXISTS);
                    });
            }
        })
    );

    app.post('/auth/login', (req, res, next) => {
        passport.authenticate('local', function (info, user, data) {
            if (!user) {
                res.status(HTTP_STATUS_CODE.CLIENT_ERROR.BAD_REQUEST).send(data);
            }

            req.logIn(user, (err) => {
                if (err) {
                    return next(err);
                }

                logger('local-auth').info(`User ${user.email} successfully authenticated.`);

                return res.send(user);
            });

        })(req, res, next);
    });

};
