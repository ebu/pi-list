const router = require('express').Router();

const setupRouter = (state) => {
    router.get('/:id', (req, res) => {
        const { id } = req.params;

        res.setHeader("Content-Type", 'application/sdp'); 
        res.status(200).send(state.sdps[id]);
    });

    return router;
};

module.exports = setupRouter;
