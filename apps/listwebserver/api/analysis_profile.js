const { Router } = require('express');
const router = Router();
const HTTP_STATUS_CODE = require('../enums/httpStatusCode');
const controller = require('../controllers/analysis_profile');
const logger = require('../util/logger');

router.get('/', async (req, res, next) => {
    try {
        const all = await controller.getAll();
        const d = await controller.getDefault(req.session.passport.user.id);
        const data = {
            all: all,
            default: d.id,
        };

        res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data);
    } catch (err) {
        res.status(HTTP_STATUS_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(err);
    }
});

router.get('/all', async (req, res, next) => {
    try {
        const data = await controller.getAll();
        res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data);
    } catch (err) {
        res.status(HTTP_STATUS_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(err);
    }
});

router.get('/default', async (req, res, next) => {
    try {
        const data = await controller.getDefault(req.session.passport.user.id);
        res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data);
    } catch (err) {
        res.status(HTTP_STATUS_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(err);
    }
});

router.put('/default', async (req, res, next) => {
    try {
        const { id } = req.body;
        const userId = req.session.passport.user.id;
        logger('analysis-profile-api').info(`Setting default profile to ${id} for user ${userId}`);
        await controller.setDefault(userId, id);
        res.status(HTTP_STATUS_CODE.SUCCESS.OK).send();
    } catch (err) {
        res.status(HTTP_STATUS_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(err);
    }
});

module.exports = router;
