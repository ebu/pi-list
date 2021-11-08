import logger from './logger';
const archiver = require('archiver');
const path = require('path');
const util = require('util');
const fs = require('fs');

// async
// Zips an array of files and gives them names based on the
// basename of each file and a fixed extension
function zipFilesExt(files, outputPath, ext) {
    logger('zip-files').info(`zipping ${files.length} ${ext} files.`);
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outputPath);
        const archive = archiver('zip', {
            zlib: { level: 9 }, // Sets the compression level.
        });

        output.on('close', function () {
            logger('zip-files').info(`zipped ${files.length} ${ext} files. Total size: ${archive.pointer()} bytes`);
            resolve();
        });

        archive.on('warning', function (err) {
            if (err.code === 'ENOENT') {
                logger('zip-files').info(`warning: ${err.message}`);
            } else {
                logger('zip-files').error(`warning: ${err.message}`);
                reject(err);
            }
        });

        archive.on('error', function (err) {
            logger('zip-files').error(`warning: ${err.message}`);
            reject(err);
        });

        archive.pipe(output);
        files.forEach((file, i) => {
            const base = path.basename(file, `.${ext}`);
            const name = `${i}-${base}.${ext}`;

            archive.file(file, { name });
        });
        archive.finalize();
    });
}

// files: [{ path: <source path>, name: <name in zip> }]
async function zipFiles(files, outputPath) {
    logger('zip-files').info(`zipping ${files.length} files.`);
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outputPath);
        const archive = archiver('zip', {
            zlib: { level: 9 }, // Sets the compression level.
        });

        output.on('close', function () {
            logger('zip-files').info(`zipped ${files.length} files. Total size: ${archive.pointer()} bytes`);
            resolve();
        });

        archive.on('warning', function (err) {
            if (err.code === 'ENOENT') {
                logger('zip-files').info(`warning: ${err.message}`);
            } else {
                logger('zip-files').error(`warning: ${err.message}`);
                reject(err);
            }
        });

        archive.on('error', function (err) {
            logger('zip-files').error(`warning: ${err.message}`);
            reject(err);
        });

        archive.pipe(output);
        files.forEach((file, i) => {
            archive.file(file.path, { name: file.name });
        });
        archive.finalize();
    });
}

module.exports = {
    zipFilesExt,
    zipFiles,
};
