const fs = require('fs');
const jetpack = require('fs-jetpack');
const util = require('util');
import logger from './logger';
const API_ERRORS = require('../enums/apiErrors');
const HTTP_STATUS_CODE = require('../enums/httpStatusCode');

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

class FileSystem {
    createIfNotExists(dir) {
        jetpack.dir(dir);
    }

    readFile(filePath) {
        if (filePath.includes('.json')) {
            return readFileAsync(filePath, 'utf8').then((data) => {
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

    fileExists(filePath) {
        return jetpack.exists(filePath) === 'file';
    }

    folderExists(directoryPath) {
        return jetpack.exists(directoryPath) === 'dir';
    }

    getAllFirstLevelFolders(directoryPath) {
        const folders = jetpack.find(directoryPath, {
            matching: '*',
            recursive: false,
            files: false,
            directories: true,
        });

        return folders.map((folder) => jetpack.inspect(folder)).map((dir) => ({
            id: dir.name
        }));
    }

    readAllJSONFilesFromDirectory(directoryPath, matching = '*/*.json') {
        if (!this.folderExists(directoryPath)) return Promise.resolve([]);

        const files = jetpack.find(directoryPath, {
            matching,
            recursive: true,
        });
        const filesToRead = files.map((file) => this.readFile(file));

        return Promise.all(filesToRead);
    }

    downloadFile(filePath, filename, res) {
        if (this.fileExists(filePath)) {
            res.download(filePath, filename);
        } else {
            res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(API_ERRORS.RESOURCE_NOT_FOUND);
        }
    }

    sendFileAsResponse(filePath, res) {
        if (this.fileExists(filePath)) {
            // Verify if the file extension is related with a JSON file
            if (filePath.includes('.json')) {
                this.readFile(filePath).then((data) => res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data));
            } else {
                res.sendFile(filePath);
            }
        } else {
            res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(API_ERRORS.RESOURCE_NOT_FOUND);
        }
    }

    delete(directoryPath) {
        if (this.folderExists(directoryPath)) {
            jetpack.remove(directoryPath);
        }
    }
}

module.exports = new FileSystem();