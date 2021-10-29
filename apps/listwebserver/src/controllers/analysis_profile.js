const _ = require('lodash');
const userController = require('./user');
const constants = require('../enums/analysis');

const getAll = async () => constants.profiles;

const getDefault = async (userId) => {
    const prefs = await userController.getPreferences(userId);
    if (!prefs) throw new Error('No user preferences defined');

    let currentProfile = _.get(prefs, ['analysis', 'currentProfileId']);
    if (_.isNil(currentProfile)) {
        currentProfile = constants.profiles[0].id;
        _.set(prefs, ['analysis', 'currentProfileId'], currentProfile);
        await userController.setPreferences(userId, prefs);
    }

    const d = constants.profiles.filter((p) => p.id === currentProfile);
    if (!d) throw new Error('Default profile not found');
    return d[0];
};

const setDefault = async (userId, profileId) => {
    if (_.isNil(profileId)) throw new Error('No profile provided');

    const prefs = await userController.getPreferences(userId);
    if (!prefs) throw new Error('No user preferences defined');

    _.set(prefs, ['analysis', 'currentProfileId'], profileId);
    await userController.setPreferences(userId, prefs);
};

module.exports = {
    getAll,
    getDefault,
    setDefault,
};
