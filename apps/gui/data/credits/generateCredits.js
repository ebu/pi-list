const crawler = require('npm-license-crawler');
const path = require('path');
const fs = require('fs');

// Modules Path
const GUI_NM_ROOT_PATH = path.resolve(__dirname, '../../');
const MW_NM_ROOT_PATH = path.resolve(__dirname, '../../../listwebserver/');

// Credits File
const CREDITS_FILEPATH = path.resolve(__dirname, 'credits.json');
const CREDITS_UNKNOWN_FILEPATH = path.resolve(__dirname, 'creditsunknown.json');

const ERROR_FILEPATH = path.resolve(__dirname, 'err.log');

/*
 ************  Clear files  ***************
 */
fs.stat(ERROR_FILEPATH, err => {
    if (err) return;
    fs.unlinkSync(ERROR_FILEPATH);
});

fs.stat(CREDITS_FILEPATH, err => {
    if (err) return;
    fs.unlinkSync(CREDITS_FILEPATH);
});

fs.stat(CREDITS_UNKNOWN_FILEPATH, err => {
    if (err) return;
    fs.unlinkSync(CREDITS_UNKNOWN_FILEPATH);
});

/*
    LICENSE DUMP
*/
const optionsKnown = {
    start: [`${GUI_NM_ROOT_PATH}`, `${MW_NM_ROOT_PATH}`],
    json: `${CREDITS_FILEPATH}`,
    unknown: false,
    onlyDirectDependencies: true,
};

crawler.dumpLicenses(optionsKnown, (error, res) => {
    if (error) {
        fs.writeFileSync(ERROR_FILEPATH, error, { flag: 'a' }, err => {
            if (err) throw err;
        });
    }
});

const optionsUnknown = {
    start: [`${GUI_NM_ROOT_PATH}`, `${MW_NM_ROOT_PATH}`],
    json: `${CREDITS_UNKNOWN_FILEPATH}`,
    unknown: true,
    onlyDirectDependencies: true,
};

crawler.dumpLicenses(optionsUnknown, (error, res) => {
    if (error) {
        fs.writeFileSync(ERROR_FILEPATH, error, { flag: 'a' }, err => {
            if (err) throw err;
        });
    }
});
