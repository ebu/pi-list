const { Router } = require('express');
const router = Router();
const HTTP_STATUS_CODE = require('../enums/httpStatusCode');
const logger = require('../util/logger');
const controller = require('../controllers/workflow');
const { getUserFolder, } = require('../util/analysis');

router.get('/', (req, res, next) => {
    const workflows = controller.getWorkflows();
    res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(workflows);
});

router.post('/', (req, res, next) => {
    const { type, configuration } = req.body;
    logger('workflow-api').info(`Create workflow request for ${type}`);
    configuration.cookie = req.headers.cookie;

    const userId = req.session.passport.user.id;
    const userFolder = getUserFolder(req);

    controller.createWorkflow(type, userId, userFolder, configuration)
        .then(id =>
            res.status(HTTP_STATUS_CODE.SUCCESS.CREATED).send({ id })
        )
        .catch(err =>
            res
                .status(HTTP_STATUS_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR)
                .send(err.message)
        );
});

router.put('/', (req, res, next) => {
    const { type, configuration } = req.body;
    logger('workflow-api').info(`Cancel workflow request for ${type}`);
    configuration.cookie = req.headers.cookie;

    controller.cancelWorkflow(type, configuration)
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
