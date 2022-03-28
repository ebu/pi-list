import * as express from 'express';
import logger from '../util/logger';
import Pcap from '../models/pcap';
import * as path from 'path';
import { getUserFolder } from '../util/analysis/utils';
import fs from 'fs';
import { getUserId } from '../auth/middleware';
import * as HTTP_STATUS_CODE from '../enums/httpStatusCode';
import * as API_ERRORS from '../enums/apiErrors';
import Stream from '../models/stream';
const {
    zipFilesExt
} = require('../util/zip');
import * as util from 'util';
const glob = util.promisify(require('glob'));

let router = express.Router();

function isAuthorized(req: express.Request, res: express.Response, next: express.NextFunction) {
    const { pcapID } = req.params;

    if (pcapID) {
        const userId = getUserId(req);

        Pcap.findOne({
            owner_id: userId,
            id: pcapID,
        })
            .exec()
            .then((data: any) => {
                if (data) next();
                else res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(API_ERRORS.RESOURCE_NOT_FOUND);
            })
            .catch(() => res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(API_ERRORS.RESOURCE_NOT_FOUND));
    } else next();
}

// Check if the user can access the pcap
router.use('/:pcapID', isAuthorized);

/* Get sdp.sdp file for a pcap */
router.get('/:pcapID/sdp', async (req, res, next) => {
    const { pcapID } = req.params;

    logger('sdp-get').info(`Getting SDP for ${pcapID}`);

    //Get Pcap data
    const pcapData = await Pcap.findOne({ id: pcapID, }).exec()

    //Get streams data from the received pcap
    const streamsData = await Stream.find({ pcap: req.params.pcapID }).exec();

    const folder = getUserFolder(req);

    //Remove characters that can't be used on a filename and adds -sdp to the end
    const sdpFilename = pcapData.file_name.replace(/\.[^\.]*$/, '-sdp')

    //Goes to all the streams and checks if they have sdps, if yes a file is created with the raw sdp
    streamsData.map(async (data: any, index: number) => {
        const sdpPath = path.join(`${folder}`, `${pcapID}`, `${sdpFilename}-${index}.txt`);
        if (!data.sdp) return;
        await fs.writeFileSync(sdpPath, data.sdp.sdp.raw);
    })

    //Remove characters that can't be used on a filename and adds -sdp.zip to the end
    const zipFilename = pcapData.file_name.replace(/\.[^\.]*$/, '-sdp.zip').replace(RegExp('/', 'g'), '-');
    //Gets all the sdps from the folder
    const files = await glob(`${folder}/${pcapID}/*.txt`);
    const pathToSaveZip = path.join(`${folder}`, `${pcapID}`, `${zipFilename}`);
    //Zip all the files with a txt extension
    await zipFilesExt(files, pathToSaveZip, 'txt');

    res.download(pathToSaveZip, zipFilename, (err) => {
        if (err) {
            next(err);
        } else {
            logger('download').info(`File ${files}`);
        }
    });
});

module.exports = router;