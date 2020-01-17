const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// GUI
const GUI_NM_ROOT_PATH = path.resolve(__dirname, '../../');
const GUI_MODULES_FILEPATH = path.resolve(__dirname, 'guicredits.json');

// MW
const MW_NM_ROOT_PATH = path.resolve(__dirname, '../../../listwebserver/');
const MW_MODULES_FILEPATH = path.resolve(__dirname, 'mwcredits.json');

const STDERROR_FILEPATH = path.resolve(__dirname, 'stderr.log');
const ERROR_FILEPATH = path.resolve(__dirname, 'err.log');
let ERRORS_COUNT = 0;

/*
 ************  Clear files  ***************
 */

/*
    LOGS
*/
fs.stat(STDERROR_FILEPATH, err => {
    if (err) {
        return;
    }

    fs.unlinkSync(STDERROR_FILEPATH);
});

fs.stat(ERROR_FILEPATH, err => {
    if (err) {
        return;
    }

    fs.unlinkSync(ERROR_FILEPATH);
});

/*
    GUI
*/
fs.stat(GUI_MODULES_FILEPATH, err => {
    if (err) {
        return;
    }

    fs.unlinkSync(GUI_MODULES_FILEPATH);
});

/*
    MW
 */
fs.stat(MW_MODULES_FILEPATH, err => {
    if (err) {
        return;
    }

    fs.unlinkSync(MW_MODULES_FILEPATH);
});

/*
    GUI
*/
ERRORS_COUNT = 0;
const checkGUI = spawn(
    'npx',
    ['license-checker', `--start ${GUI_NM_ROOT_PATH}`, '--json', '--production', '--direct', '--unknown'],
    { cwd: `${GUI_NM_ROOT_PATH}` }
);

checkGUI.stdout.on('data', data => {
    fs.writeFileSync(GUI_MODULES_FILEPATH, data, { flag: 'a' }, err => {
        if (err) throw err;
    });
});

checkGUI.on('close', code => {
    console.log(`Exited with code ${code} and ${ERRORS_COUNT} errors.`);
});

checkGUI.stderr.on('data', data => {
    fs.writeFileSync(ERROR_FILEPATH, data, { flag: 'a' }, err => {
        if (err) throw err;
    });
});

checkGUI.on('error', errorFromProcess => {
    fs.writeFileSync(STDERROR_FILEPATH, errorFromProcess, { flag: 'a' }, err => {
        if (err) throw err;
    });
});

checkGUI.on('close', code => {
    console.log(`\n Credits for GUI soft finished with code ${code} and ${ERRORS_COUNT} errors.`);
});

/*
    MW
*/
ERRORS_COUNT = 0;
const checkMW = spawn(
    'npx',
    ['license-checker', `--start ${MW_NM_ROOT_PATH}`, '--json', '--production', '--direct', '--unknown'],
    { cwd: `${MW_NM_ROOT_PATH}` }
);

checkMW.stdout.on('data', data => {
    fs.writeFileSync(MW_MODULES_FILEPATH, data, { flag: 'a' }, err => {
        if (err) throw err;
    });
});

checkMW.on('close', code => {
    console.log(`Exited with code ${code} and ${ERRORS_COUNT} errors.`);
});

checkMW.stderr.on('data', data => {
    fs.writeFileSync(ERROR_FILEPATH, data, { flag: 'a' }, err => {
        if (err) throw err;
    });
});

checkMW.on('error', errorFromProcess => {
    fs.writeFileSync(STDERROR_FILEPATH, errorFromProcess, { flag: 'a' }, err => {
        if (err) throw err;
    });
});

checkMW.on('close', code => {
    console.log(`\n Credits for MW soft finished with code ${code} and ${ERRORS_COUNT} errors.`);
});
