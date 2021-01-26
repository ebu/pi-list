/**
 * Enum for constants that will be used across the LIST web server
 */
const CONSTANTS = {

    // File system constants
    PACKET_FILE: 'packets.json',
    META_FILE: '_meta.json',
    HELP_FILE: '_help.json',
    CINST_FILE: 'cinst.json',
    VRX_FILE: 'vrx.json',
    ANC_PKT_FILE: 'pkt_hist.json',
    PNG_FILE: 'frame.png',
    JPG_FILE: 'thumbnail.jpg',

    // Maximum size for log file (10 MB)
    MAX_LOG_SIZE_10_MB: 10000000
};

module.exports = CONSTANTS;
