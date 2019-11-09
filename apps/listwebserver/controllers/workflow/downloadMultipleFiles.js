const websocketManager = require('../../managers/websocket');
const WS_EVENTS = require('../../enums/wsEvents');
const util = require('util');
const path = require('path');
const os = require('os');
const glob = util.promisify(require('glob'));
const { zipFiles } = require('../../util/zip');
const pcapController = require('../../controllers/pcap');
const fs = require('../../util/filesystem');
const Pcap = require('../../models/pcap');
const logger = require('../../util/logger');

// TODO: some files may end in, say .pcap.gz but we don't deal with that
const removeExtension = orig => path.parse(orig).name;

const getFiles = async (wf, inputConfig) => {
    const type = inputConfig.type;
    const ext = (type === 'sdp')? 'zip' : type; // sdp files are already bundled in pcap zipFolder
    const userID = wf.meta.createdBy;
    const zipFolder = wf.meta.folder;

    switch (type) {
        case 'orig': { // get original filenames
            const getOrigPromise = inputConfig.ids.map(async pcapID => {
                const data = await Pcap.findOne({ id: pcapID }).exec();
                console.log(data);
                return { path: `${zipFolder}/${pcapID}/${data.capture_file_name}`, name: data.file_name };
            });
            return await Promise.all(getOrigPromise);
        }

        case 'pcap': {
            const getOrigPromise = inputConfig.ids.map(async pcapID => {
                const data = await Pcap.findOne({ id: pcapID }).exec();
                console.log(data);
                const destName = removeExtension(data.file_name) + '.pcap';
                return { path: `${zipFolder}/${pcapID}/${data.pcap_file_name}`, name: destName };
            });
            return await Promise.all(getOrigPromise);
        }

        case 'sdp': // these files can be found by extension only
            const pattern = `${zipFolder}/+(${inputConfig.ids.join('|')})/**/*.${ext}`;
            const files = await glob(pattern);
            return files.map(file => ({ path: file, name: path.basename(file) }));

        case 'json': // reports needs to be generated in a temp directory
        case 'pdf':
            const dir = path.join(os.tmpdir(), wf.id);
            fs.createIfNotExists(dir);
            try {
                const getReportPromises = inputConfig.ids.map(async pcapID => {
                    const report = await pcapController.getReport(pcapID, ext);
                    const data = await Pcap.findOne({ id: pcapID }).exec();
                    const filename = data.file_name.replace(/\.[^\.]*$/, `.${ext}`);
                    fs.writeFile(`${dir}/${filename}`, report);
                    return { path: `${dir}/${filename}`, name: filename};
                });
                return await Promise.all(getReportPromises);

            } catch {
                logger('download-multiple').error(`Could not find report for id: ${pcapID}`);
                return [];
            }

        default:
            websocketManager.instance().sendEventToUser(userID, {
                event: WS_EVENTS.ZIP_FILE_FAILED,
                data: {
                    id: wf.id,
                    date: Date.now(),
                    type: type,
                    msg: 'not supported',
                },
            });
            return [];
    }
};

const createWorkflow = async (wf, inputConfig, workSender) => {
    const type = inputConfig.type;
    const ext = (type === 'sdp')? 'zip' : type; // sdp files are already bundled in pcap zipFolder
    const userID = wf.meta.createdBy;
    const zipFolder = wf.meta.folder;
    const zipFile = `${zipFolder}/${wf.id}_${type}.zip`;
    const files = await getFiles(wf, inputConfig);

    logger('download-multiple').info(`Files to be zipped: ${files}`);

    if (files.length === 0) {
        websocketManager.instance().sendEventToUser(userID, {
            event: WS_EVENTS.ZIP_FILE_FAILED,
            data: {
                id  : wf.id,
                date: Date.now(),
                type: type,
                msg : 'no file found'
            },
        });
        return;
    }

    zipFiles(files, zipFile, ext)
        .then(() => {
            websocketManager.instance().sendEventToUser(userID, {
                event: WS_EVENTS.ZIP_FILE_COMPLETE,
                data: {
                    id: wf.id,
                    type: type,
                    date: Date.now(),
                    msg: files.map(f => f.name).join(','),
                },
            });
        })
        .catch(() => {
            websocketManager.instance().sendEventToUser(userID, {
                event: WS_EVENTS.ZIP_FILE_FAILED,
                data: {
                    id: wf.id,
                    type: type,
                    date: Date.now(),
                    msg: 'archive error',
                },
            });
        });
};

module.exports = {
    createWorkflow,
};
