const { Router } = require('express');
const router = Router();
const HTTP_STATUS_CODE = require('../enums/httpStatusCode');
const logger = require('../util/logger');
const { createWorkflow } = require('../controllers/workflow');

router.get('/', (req, res, next) => {
    const workflows = [];
    res.status(HTTP_STATUS_CODE.SUCCESS.CREATED).send(workflows);
    next();
});

router.post('/', (req, res, next) => {
    const { type, configuration } = req.body;
    logger('workflow-api').info(`Create workflow request for ${type}`);
    configuration.cookies = req.cookies;
    console.dir(configuration);
    createWorkflow(type, configuration)
        .then(id =>
            res.status(HTTP_STATUS_CODE.SUCCESS.CREATED).send({ id })
        )
        .catch(err =>
            res
                .status(HTTP_STATUS_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR)
                .send(err)
        );
});

module.exports = router;
