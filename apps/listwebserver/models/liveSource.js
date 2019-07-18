const mongoose = require('mongoose');
const db = require('../managers/database')('live');

const LiveSourceSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        required: true
    },
    kind: {
        type: String,
        required: true
    },
    meta: {
        type: mongoose.Schema.Types.Mixed
    },
    sdp: {
        type: mongoose.Schema.Types.Mixed
    },
    nmos: {
        type: mongoose.Schema.Types.Mixed
    },
});


module.exports = db.model('sources', LiveSourceSchema);
