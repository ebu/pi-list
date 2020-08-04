const util = require('util');
const fs = require('fs');
const _ = require('lodash');
const logger = require('../logger');
const controller = require('../../controllers/analysis_profile');
const path = require('path');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);
const { getUserId } = require('../../auth/middleware');

const getAnalysisProfile = async (req, res, next) => {
    const userId = getUserId(req);
    const defaultProfile = await controller.getDefault(userId);
    console.dir(defaultProfile);
    const pcapFolder = req.pcap.folder;
    const profileFile = path.join(pcapFolder, 'profile.json');
    logger('analysis-profile').info(`Writing analysis profile to ${profileFile}`);
    const json = JSON.stringify(defaultProfile);
    await writeFile(profileFile, json, 'utf8');
    req.analysisProfile = defaultProfile;
    req.analysisProfileFile = profileFile;
    next();
};

module.exports = {
    getAnalysisProfile,
};
