const { Router } = require('express');
const db = require('../managers/database');
const websocket = require('../managers/websocket');
const router = Router();
const fs = require('../util/filesystem');
const program = require('../util/programArguments');
const HTTP_STATUS_CODE = require('../enums/httpStatusCode');

/**
 * GET /api/user
 *
 * Gets the information about current logged user
 */
router.get('/', (req, res) => {
    res.send(req.session.passport.user);
});

/**
 * DELETE /api/user
 *
 * Deletes the current logged user.
 * This method actually deletes the current user information and files associated with it.
 */
router.delete('/', (req, res) => {
    const { user } = req.session.passport;

    db.deleteUserById(user.id)
        .then(() => {
            // delete folders
            fs.delete(`${program.folder}/${req.session.passport.user.id}`);

            // logout
            req.logout();
            res.status(HTTP_STATUS_CODE.SUCCESS.OK).send();
        })
        .catch((data) => {
            res.status(400).send(data);
        });
});


module.exports = router;
