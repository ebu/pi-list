const router = require('express').Router();
const fs = require('../util/filesystem');
const program = require('../util/programArguments');

const fakePCAPID = 'live-pcap';

// get all "live" streams, active or not
router.get('/streams', (req, res) => {
    const liveUserPath = `${program.folder}/${req.session.passport.user.id}/${fakePCAPID}`;
    fs.createIfNotExists(liveUserPath); // todo: remove me when we stop using filesystem

    res.redirect(`/api/pcap/${fakePCAPID}/streams/`);
});

router.get('/streams/:streamID/', (req, res) => {
    // get a single stream definition
    const { streamID } = req.params;
    res.redirect(`/api/pcap/${fakePCAPID}/stream/${streamID}`);
});

module.exports = router;
