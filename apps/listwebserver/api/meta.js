const logger = require('../util/logger');
const router = require('express').Router();
const program = require('../util/programArguments');
const HTTP_STATUS_CODE = require('../enums/httpStatusCode');
const { getUserFolder, } = require('../util/analysis');
const fs = require('../util/filesystem');

// get the features currently enabled
router.get('/features', (req, res) => {
    res.status(HTTP_STATUS_CODE.SUCCESS.OK).send({"liveFeatures": program.liveMode});
});

router.get('/version', (req, res) => {
    res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(program.version);
});

/* Get ZIP containing ay type of file */
router.get('/zip', (req, res) => {
    const id = req.query.id;
    const type = req.query.type;
    const path = `${getUserFolder(req)}/${id}_${type}.zip`;
    logger('meta-zip').info(`Get zipped ${type}: ${path}`);
    fs.downloadFile(path, `selection_${type}.zip`, res);
});

module.exports = router;
