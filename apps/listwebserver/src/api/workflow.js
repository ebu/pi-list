const {
    Router
} = require('express');
const router = Router();
const HTTP_STATUS_CODE = require('../enums/httpStatusCode');
import logger from '../util/logger';
const controller = require('../controllers/workflow');
const {
    getUserId,
    checkIsReadOnly
} = require('../auth/middleware');
import {
    getUserFolder
} from '../util/analysis/utils';

router.get('/', (req, res, next) => {
    const workflows = controller.getWorkflows();
    res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(workflows);
});

router.post('/', (req, res, next) => {
    const {
        type,
        configuration
    } = req.body;
    logger('workflow-api').info(`Create workflow request for ${type}`);
    configuration.authorization = req.headers.authorization;

    const userId = getUserId(req);
    const userFolder = getUserFolder(req);

    controller.createWorkflow(type, userId, userFolder, configuration);

    res.status(HTTP_STATUS_CODE.SUCCESS.OK).send();
});

router.put('/', (req, res, next) => {
    const {
        type,
        configuration
    } = req.body;
    logger('workflow-api').info(`Cancel workflow request for ${type}`);
    configuration.cookie = req.headers.cookie;

    controller
        .cancelWorkflow(type, configuration)
        .then((id) => res.status(HTTP_STATUS_CODE.SUCCESS.CREATED).send({
            id
        }))
        .catch((err) => res.status(HTTP_STATUS_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(err));
});

module.exports = router;