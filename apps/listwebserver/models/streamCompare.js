const mongoose = require('mongoose');
const db = require('../managers/database')('offline');

const StreamCompareSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        required: true,
    },
    owner_id: {
        type: String,
        unique: false,
        required: true,
    },
    name: {
        type: String,
        unique: false,
        required: true,
    },
    date: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    config: {
        type: Object,
    },
    result: {
        type: Object,
    },
});

StreamCompareSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
});

module.exports = db.model('streamCompare', StreamCompareSchema);
