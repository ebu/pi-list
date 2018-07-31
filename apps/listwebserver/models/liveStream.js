const mongoose = require('mongoose');
const db = require('../managers/database')('live');

const StreamSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        required: true
    },
    owner_id: {
        type: String,
        unique: false,
        required: true
    },
    media_type: {
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
    }
});

StreamSchema.set('toJSON', {
    versionKey: false,
    transform: (doc, stream) => {
        delete stream._id;
    }
});

module.exports = db.model('streams', StreamSchema);
