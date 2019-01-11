const fs = require('fs');
const jetpack = require('fs-jetpack');
const util = require('util');
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);
const logger = require('./logger');
const API_ERRORS = require('../enums/apiErrors');
const HTTP_STATUS_CODE = require('../enums/httpStatusCode');

class FileSystem {

    /**
     *
     * @param filePath
     */

    createIfNotExists(dir) {
        jetpack.dir(dir);
    }

    /**
     *
     * @param filePath
     * @returns {Promise}
     */
    readFile(filePath) {
        if (filePath.includes('.json')) {
            return readFileAsync(filePath, 'utf8')
                .then(data => {
                    try {
                        return JSON.parse(data);
                    } catch (e) {
                        logger('fs').error(`Invalid JSON Exception. File Path: ${filePath} Error Stack:${e}`);
                        throw new Error(`Invalid JSON Exception. File Path: ${filePath}`);
                    }
                });
        }
        return readFileAsync(filePath, 'utf8');
    }

    writeFile(filePath, content) {
        if (filePath.includes('.json')) {
            content = JSON.stringify(content);
        }
        return writeFileAsync(filePath, content, 'utf8');
    }

    /**
     *
     * @param filePath
     * @returns {boolean}
     */
    fileExists(filePath) {
        return jetpack.exists(filePath) === 'file';
    }

    /**
     *
     * @param directoryPath
     * @returns {boolean}
     */
    folderExists(directoryPath) {
        return jetpack.exists(directoryPath) === 'dir';
    }

    /**
     *
     * @param directoryPath
     */
    getAllFirstLevelFolders(directoryPath) {
        const folders = jetpack.find(directoryPath, {
            matching: '*',
            recursive: false,
            files: false,
            directories: true
        });

        return folders
            .map(folder => jetpack.inspect(folder))
            .map(dir => ({ id: dir.name }));
    }

    /**
     *
     * @param {String} directoryPath
     * @returns {Promise}
     */
    readAllJSONFilesFromDirectory(directoryPath, matching = '*/*.json') {

        if(!this.folderExists(directoryPath)) return Promise.resolve([]);

        const files = jetpack.find(directoryPath, {
            matching,
            recursive: true
        });
        const filesToRead = files.map(file => this.readFile(file));

        return Promise.all(filesToRead);
    }


    downloadFile(filePath, filename, res) {
        if(this.fileExists(filePath)) {
            res.download(filePath, filename);
        } else {
            res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(API_ERRORS.RESOURCE_NOT_FOUND);
        }
    }

    /**
     *
     * @param filePath
     * @param res
     */
    sendFileAsResponse(filePath, res) {
        if(this.fileExists(filePath)) {
            this.readFile(filePath).then(data => res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data));
        } else {
            res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(API_ERRORS.RESOURCE_NOT_FOUND);
        }
    }

    delete(directoryPath) {
        jetpack.remove(directoryPath);
    }
}

module.exports = new FileSystem();
