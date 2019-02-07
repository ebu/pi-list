const mongoose = require('mongoose');
const db = require('../managers/database')('offline');

const PcapSchema = new mongoose.Schema({
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
    file_name: {
        type: String,
        unique: false,
        required: true
    },
    pcap_file_name: {
        type: String,
        required: true
    },
    date: {
      type: Number,
      required: true
    },
    analyzed: {
        type: Boolean,
        default: false
    },
    error: {
        type: String,
        default: ''
    },
    offset_from_ptp_clock: {
        type: Number,
        default: 0
    },
    anc_streams: {
        type: Number,
        default: 0
    },
    audio_streams: {
        type: Number,
        default: 0
    },
    video_streams: {
        type: Number,
        default: 0
    },
    total_streams: {
        type: Number,
        default: 0
    },
    narrow_linear_streams: {
        type: Number,
        default: 0
    },
    narrow_streams: {
        type: Number,
        default: 0
    },
    not_compliant_streams: {
        type: Number,
        default: 0
    },
    wide_streams: {
        type: Number,
        default: 0
    },
    generated_from_network: {
        type: Boolean,
        default: false
    }
});

PcapSchema.set('toJSON', {
    versionKey: false
});

module.exports = db.model('pcaps', PcapSchema);
