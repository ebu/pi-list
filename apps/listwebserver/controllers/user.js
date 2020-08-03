const _ = require('lodash');
const collection = require('../models/user');
const logger = require('../util/logger');
const HTTP_STATUS_CODE = require('../enums/httpStatusCode');
const { getUserId } = require('../auth/middleware');
const { defaultPreferences } = require('../auth/middleware');

const getPreferences = async userId => {
    const user = await collection.findOne({ id: userId }).exec();
    if (user === null) return null;
    return user.preferences;
};

const setPreferences = async (userId, newPreferences) => {
    const user = await collection.findOne({ id: userId }).exec();
    if (user === null) {
        throw new Error(`User ${userId} not found`);
    }

    user.preferences = newPreferences;
    await user.save();
};

async function getUser(username) {
    const user = await collection.findOne({ username: username }).select(["-salt", "-password"]).exec();
    if (user === null) return null;
    if (user.preferences === null) user.preferences = defaultPreferences;

    setPreferences(user.id, defaultPreferences);

    return user;
}

function updatePreferences(req, res, next) {
    const userId = getUserId(req);

    const value = req.body.value;

    collection.findOne({ id: userId })
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
