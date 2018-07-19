const { isObject } = require('lodash');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const programArguments = require('../util/programArguments');
const logger= require('../util/logger');
const User = require('../models/user');

module.exports = (app) => {
    passport.use(
        new FacebookStrategy({
                clientID: programArguments.facebook.APP_ID,
                clientSecret: programArguments.facebook.APP_SECRET,
                callbackURL: programArguments.facebook.CALLBACK_URL,
                profileFields: ['emails', 'displayName', 'name', 'photos']
            }, (accessToken, refreshToken, profile, done) => {
                User.findOne({ email: profile.emails[0].value })
                    .then((user) => {
                        if (!isObject(user)) {
                            return User.create({
                                username: profile.displayName,
                                email: profile.emails[0].value,
                                password: profile.id,
                                photoURL: isObject(profile.photos[0]) ? profile.photos[0].value : null,
                                facebookID: profile.id
                            });
                        }

                        return user;
                    })
                    .then((userData) => {
                        done(null, userData.toJSON());
                    })
                    .catch((err) => {
                        logger('facebook-auth').error(`Unable to run the findUserByEmail command. Error: ${err}`);
                        done(null, false);
                    });
            }
        )
    );

    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((user, done) => {
        done(null, user);
    });

    app.get('/auth/facebook', passport.authenticate('facebook', { scope : ['email'] }));

    app.get('/auth/facebook/callback', passport.authenticate('facebook'), (req, res) => {
        res.redirect(programArguments.webappDomain);
    });

    app.get('/auth/facebook/failed', (req, res) => {
        logger('test').info(req);
    });

};
