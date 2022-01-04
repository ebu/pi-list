const mongoose = require('mongoose');
const db = require('../managers/database')('list');

const DownloadManagerSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    nameondisk: {
        type: String,
        required: true,
    },
    path: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    availableon: {
        type: String,
        required: true,
    },
    availableonfancy: {
        type: String,
        required: true,
    },
    availableuntil: {
        type: String,
        required: true,
    },
    availableuntilfancy: {
        type: String,
        required: true,
    },
}, {
    collection: 'downloadmanager',
});

module.exports = db.model('downloadmanager', DownloadManagerSchema);