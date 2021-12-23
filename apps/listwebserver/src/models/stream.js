const mongoose = require('mongoose');
const db = require('../managers/database')('offline');

const StreamSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        required: true,
    },
    media_type: {
        type: String,
        required: true,
    },
    pcap: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    alias: {
        type: String,
    },
    media_specific: {
        type: mongoose.Schema.Types.Mixed,
    },
    network_information: {
        type: Object,
    },
    statistics: {
        type: Object,
    },
    media_type_validation: {
        type: Object,
    },
    global_video_analysis: {
        type: Object,
    },
    global_audio_analysis: {
        type: Object,
    },
    analyses: {
        type: Object,
    },
    error_list: {
        type: Array,
    },
    processing: {
        type: Object,
    },
    full_media_type: {
        type: String,
    },
    full_transport_type: {
        type: String,
    },
});

StreamSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
});

module.exports = db.model('streams', StreamSchema);
