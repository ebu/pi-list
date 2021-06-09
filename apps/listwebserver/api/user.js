const { Router } = require('express');
const router = Router();
const fs = require('../util/filesystem');
const program = require('../util/programArguments');
const HTTP_STATUS_CODE = require('../enums/httpStatusCode');
const API_ERRORS = require('../enums/apiErrors');
const collection = require('../models/user');
const userController = require('../controllers/user');
const { getUsername, getUserId, revalidateToken, checkIsReadOnly } = require('../auth/middleware');
const websocket = require('../managers/websocket');

router.get('/revalidate-token', (req, res) => {
    revalidateToken(req, res);
});

/**
 * DELETE /api/user
 *
 * Deletes the current logged user.
 * This method actually deletes the current user information and files associated with it.
 */
router.post('/delete', checkIsReadOnly, (req, res) => {
    const userId = getUserId(req);

    collection
        .remove({ id: userId })
        .then(() => {
            // delete folders
            //fs.delete(`${program.folder}/${userId}`);

            // logout
            res.status(HTTP_STATUS_CODE.SUCCESS.OK).send();
            //websocket.instance().disconnectUser(req.body.socketid);
        })
        .catch((data) => {
            res.status(400).send(data);
        });
});

/**
 * GET /api/user
 *
 * Gets the information about current logged user
 */
// router.get('/',
//     userController.getUser,
//     (req, res) => {
//         res.send(req.userInfo);
//     }
// );

router.get('/', (req, res) => {
    const username = getUsername(req);

    userController
        .getUser(username)
        .then((user) => {
            if (user) {
                res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(user);
            } else {
                res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(API_ERRORS.RESOURCE_NOT_FOUND);
            }
        })
        .catch(() => {
            res.status(HTTP_STATUS_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR).send();
        });
});

/**
 * PATCH /api/user/preferences
 *
 * Updates the user preferences.
 */
router.patch('/preferences', checkIsReadOnly, (req, res, next) => {
    userController.updatePreferences(req, res, next);
});

router.patch('/read-only', checkIsReadOnly, (req, res) => {
    userController
        .setReadOnly(req)
        .then((user) => {
            if (user === null) {
                res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(API_ERRORS.RESOURCE_NOT_FOUND);
                return;
            } else {
                res.status(HTTP_STATUS_CODE.SUCCESS.OK).send();
            }
        })
        .catch((e) => {
            res.status(HTTP_STATUS_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR).send();
        });
});

// GDPR

const gdprstatus = {
    gdprAccepted: false,
    collectMetrics: true,
};

router.get('/gdpr', (req, res) => {
    userController
        .getGDPRData(req)
        .then((data) => {
            if (data) {
                res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data);
            } else {
                res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send();
            }
        })
        .catch((err) => {
            res.status(HTTP_STATUS_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR).send();
        });
});

router.post('/gdpr', checkIsReadOnly, (req, res) => {
    userController
        .setGDPRData(req)
        .then(() => res.status(HTTP_STATUS_CODE.SUCCESS.OK).send())
        .catch(() => res.status(HTTP_STATUS_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR).send());
});

module.exports = router;
