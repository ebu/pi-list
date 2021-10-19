const router = require('express').Router();
const HTTP_STATUS_CODE = require('../enums/httpStatusCode');
import logger from '../util/logger';

const controller = require('../controllers/downloadmngr');
const path = require('path');

router.get('/', (req, res) => {
    controller
        .getAll()
        .then((data) => {
            res.status(HTTP_STATUS_CODE.SUCCESS.OK).send({ data });
        })
        .catch((err) => res.status(HTTP_STATUS_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(err.message));
});

router.get('/download/:id', (req, res, next) => {
    const fileId = req.params.id;

    controller
        .download(fileId)
        .then((data) => {
            if (data === null) {
                res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(`${fileId} does not exist.`);
                return;
            }

            res.download(path.join(data.path, data.nameondisk), data.nameondisk, (err) => {
                if (err) {
                    next(err);
                } else {
                    logger('download-manager-api').info(`File ${data.nameondisk} from  ${data.path} sent`);
                }
            });
        })
        .catch((err) => {
            res.status(HTTP_STATUS_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(err.message);
        });
});

module.exports = router;
