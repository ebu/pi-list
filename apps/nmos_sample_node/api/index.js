const router = require('express').Router();

const setupRouter = (state) => {
    router.use('/sdp', require('./sdp')(state));

    return router;
};

module.exports = setupRouter;
