/**
 *  Routing system form LIST web server private API
 *
 *  NOTE: All of those API routes are only accessible for the user that are authenticated (after the login process).
 *        When the client doesn't have a valid cookie any of those routes are inaccessible.
 */
const { Router } = require('express');

// REST API Routes
const pcapRoutes = require('./pcap');
const sdpRoutes = require('./sdp');
const userRoutes = require('./user');

// Initialize Express Router
const router = Router();

// API routes
router.use('/pcap', pcapRoutes);
router.use('/sdp', sdpRoutes);
router.use('/user', userRoutes);

module.exports = router;
