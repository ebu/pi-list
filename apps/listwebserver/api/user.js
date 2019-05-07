const { Router } = require('express');
const router = Router();
const fs = require('../util/filesystem');
const program = require('../util/programArguments');
const HTTP_STATUS_CODE = require('../enums/httpStatusCode');
const User = require('../models/user');
const userController = require('../controllers/user');

/**
 * GET /api/user
 *
 * Gets the information about current logged user
 */
router.get('/',
    userController.getUser,
    (req, res) => {
        res.send(req.userInfo);
    }
);

/**
 * DELETE /api/user
 *
 * Deletes the current logged user.
 * This method actually deletes the current user information and files associated with it.
 */
router.delete('/', (req, res) => {
    const { user } = req.session.passport;
    User.remove({ _id: user.id })
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


/**
 * PATCH /api/user/preferences
 *
 * Updates the user preferences.
 */
router.patch('/preferences',
    (req, res, next) => {
        userController.updatePreferences(req, res, next)
    }
);


module.exports = router;
