const collection = require('../models/downloadmngr');
import logger from '../util/logger';
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

/*
 * A minute of insanity
 *
 * This is so insane....
 * ... A cron to delete each file 24h after beein created
 *
 */
// Store all the scheduled crons
let tasks = {};

// Erase file item from database
function erase(id) {
    return new Promise(function (resolve, reject) {
        collection
            .findOneAndDelete({
                _id: id
            })
            .then((data) => {
                resolve(data);
            })
            .catch(function (err) {
                reject(err);
            });
    });
}

// Call erase to delete file item from database
// Delete from storage
// Destroy cron
function deleteFiles(filesToDelete) {
    if (filesToDelete === undefined) return;

    filesToDelete.forEach((fileId) => {
        erase(fileId)
            .then((data) => {
                fs.unlink(path.join(data.path, data.nameondisk), (err) => {
                    logger('cleanup').error(`Deleting file ${path.join(data.path, data.nameondisk)}`);
                });
            })
            .catch((err) => {
                logger('cleanup').error('Failed to read donwload manager files from the Database');
            });

        const task = tasks[fileId];
        if (task !== undefined) task.destroy();
    });
}

// Set cron for a file
function setCronForFile(fileItem) {
    const ts = new Date(Number(fileItem.availableuntil));
    const month = ts.getMonth();
    const date = ts.getDate();
    const hour = ts.getHours();
    const min = ts.getMinutes();

    logger('cleanup').info(
        `Set cron (${min} ${hour} ${date} ${month + 1} *) to delete the file ${fileItem.nameondisk} at ${fileItem.path}`
    );

    // const task = cron.schedule(`${min} ${hour} ${date} ${month + 1} *`, () => {
    //     deleteFiles([fileItem._id]);
    // });
    const task = cron.schedule(`31 3 10 4 *`, () => {
        deleteFiles([fileItem._id]);
    });

    tasks[fileItem._id] = task;
}

// Set cron to all the file items on the database
function cleanup() {
    logger('cleanup').info('Setting up cronjobs for file deletion');

    let filesToDelete = [];

    collection
        .find()
        .then((data) => {
            data.forEach((fileItem) => {
                if (fileItem) {
                    if (fileItem.availableuntil < Date.now()) {
                        // eslint-disable-next-line no-underscore-dangle
                        filesToDelete.push(fileItem._id);
                    } else {
                        setCronForFile(fileItem);
                    }
                }
            });
        })
        .then(() => deleteFiles(filesToDelete))
        .catch((err) => logger('cleanup').error(err));
}

// End cleanup

function add(fileItem) {
    return new Promise(function (resolve, reject) {
        collection
            .create(fileItem)
            .then(function (data) {
                setCronForFile(data);
                resolve(data);
            })
            .catch(function (err) {
                reject(err);
            });
    });
}

function getAll() {
    return new Promise(function (resolve, reject) {
        collection
            .find()
            .exec()
            .then(function (data) {
                resolve(data);
            })
            .catch(function (err) {
                reject(err);
            });
    });
}

function download(fileId) {
    return new Promise(function (resolve, reject) {
        collection
            .findOne({
                _id: fileId
            })
            .exec()
            .then(function (data) {
                resolve(data);
            })
            .catch(function (err) {
                reject(err);
            });
    });
}

module.exports = {
    add,
    getAll,
    download,
    cleanup,
};