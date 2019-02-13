const mongoose = require('mongoose');
const db = require('../managers/database')('offline');

const StreamSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        required: true
    },
    media_type: {
        type: String,
        required: true
    },
    pcap: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    alias: {
        type: String
    },
    media_specific: {
        type: mongoose.Schema.Types.Mixed
    },
    network_information: {
        type: Object
    },
    statistics: {
        type: Object
    },
    global_video_analysis: {
        type: Object
    },
    global_audio_analysis: {
        type: Object
    }
});

StreamSchema.set('toJSON', {
    virtuals: true,
    versionKey: false
});

module.exports = db.model('streams', StreamSchema);
