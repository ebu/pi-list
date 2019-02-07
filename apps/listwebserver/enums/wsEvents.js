/**
 * Enums for Websocket events
 */

const deepFreeze = require('deep-freeze');

const WS_EVENTS = {
    PCAP_FILE_RECEIVED: 'PCAP_FILE_RECEIVED',
    PCAP_FILE_PROCESSED: 'PCAP_FILE_PROCESSED',
    PCAP_FILE_ANALYZING: 'PCAP_FILE_ANALYZING',
    PCAP_FILE_FAILED: 'PCAP_FILE_FAILED',
    PCAP_FILE_PROCESSING_DONE: 'PCAP_FILE_PROCESSING_DONE',
};

module.exports = deepFreeze(WS_EVENTS);
