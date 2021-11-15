const router = require('express').Router();
const program = require('../util/programArguments');
const HTTP_STATUS_CODE = require('../enums/httpStatusCode');

// get the features currently enabled
router.get('/features', (req, res) => {
    res.status(HTTP_STATUS_CODE.SUCCESS.OK).send({
        liveFeatures: program.liveMode
    });
});

module.exports = router;