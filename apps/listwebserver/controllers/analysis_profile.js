const uuidv1 = require('uuid/v1');
const logger = require('../util/logger');
const _ = require('lodash');
const userController = require('./user');

const profiles = [
    {
        id: '5b2203b2-0aec-40fa-b0da-2f36a1c06af6',
        label: 'JT-NM Tested',
        timestamps: {
            source: 'pcap',
        },
    },
    {
        id: 'b89d08b5-0dc8-4860-b5d5-32d2a051957e',
        label: 'JT-NM Tested (use PTP packets to derive clock)',
        timestamps: {
            source: 'ptp_packets',
        },
    },
];

const getAll = async () => profiles;

const getDefault = async userId => {
    const prefs = await userController.getPreferences(userId);
    if (!prefs) throw new Error('No user preferences defined');

    let currentProfile = _.get(prefs, ['analysis', 'currentProfileId']);
    if (_.isNil(currentProfile)) {
        currentProfile = profiles[0].id;
        _.set(prefs, ['analysis', 'currentProfileId'], currentProfile);
        await userController.setPreferences(userId, prefs);
    }

    const d = profiles.filter(p => p.id === currentProfile);
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
