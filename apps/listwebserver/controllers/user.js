const _ = require('lodash');
const User = require('../models/user');
const logger = require('../util/logger');
const HTTP_STATUS_CODE = require('../enums/httpStatusCode');

const defaultPreferences = {
    gui: {
        theme: 'dark',
        language: 'en-US',
    },
    analysis: {
        currentProfileId: null,
    },
};

const getPreferences = async userId => {
    const user = await User.findOne({ _id: userId }).exec();
    if (user === null) return null;
    return user.preferences;
};

const setPreferences = async (userId, newPreferences) => {
    const user = await User.findOne({ _id: userId }).exec();
    if (user === null) {
        throw new Error(`User ${userId} not found`);
    }

    user.preferences = newPreferences;
    await user.save();
};

function getUser(req, res, next) {
    const info = req.session.passport.user;

    const hasPreferences = !!info.preferences;

    info.preferences = _.merge(defaultPreferences, info.preferences || {});
    req.userInfo = info;

    if (!hasPreferences) {
        User.findOne({ _id: info.id })
            .exec()
            .then(user => {
                if (user === null) {
                    res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(API_ERRORS.RESOURCE_NOT_FOUND);
                    return;
                }

                user.preferences = info.preferences;
                return user.save().then(d => {
                    next();
                });
            })
            .catch(e => {
                res.status(HTTP_STATUS_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR).send();
            });
    } else {
        next();
    }
}

function updatePreferences(req, res, next) {
    const { user } = req.session.passport;
    const value = req.body.value;

    User.findOne({ _id: user.id })
        .exec()
        .then(user => {
            if (user === null) {
                res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(API_ERRORS.RESOURCE_NOT_FOUND);
                return;
            }

            const preferences = _.merge(user.preferences, value);
            user.preferences = preferences;
            return user.save().then(d => {
                res.status(HTTP_STATUS_CODE.SUCCESS.OK).send({ value: d });
            });
        })
        .catch(e => {
            res.status(HTTP_STATUS_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR).send();
        });
}

module.exports = {
    getUser,
    updatePreferences,
    getPreferences,
    setPreferences,
};
