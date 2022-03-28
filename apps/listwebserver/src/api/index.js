/**
 *  Routing system form LIST web server private API
 *
 *  NOTE: All of those API routes are only accessible for the user that are authenticated (after the login process).
 *        When the client doesn't have a valid cookie any of those routes are inaccessible.
 */
const { Router } = require('express');
const program = require('../util/programArguments');
const pcap2  = require('./pcap2');

// Initialize Express Router
const router = Router();

// API routes
router.use('/pcap', require('./pcap'));
router.use('/pcap', pcap2);
router.use('/sdp', require('./sdp'));
router.use('/user', require('./user'));
router.use('/meta', require('./meta'));
router.use('/analysis_profile', require('./analysis_profile'));
router.use('/workflow', require('./workflow'));
router.use('/comparisons', require('./comparisons'));
router.use('/downloadmngr', require('./downloadmngr'));
router.use('/news', require('./news.js'));

if (program.liveMode) {
    router.use('/live', require('./live'));
}

module.exports = router;
