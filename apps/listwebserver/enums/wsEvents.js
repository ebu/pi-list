/**
 * Enums for Websocket events
 */

const deepFreeze = require('deep-freeze');

const WS_EVENTS = {
    MP3_FILE_RENDERED: 'MP3_FILE_RENDERED',
    PCAP_FILE_RECEIVED: 'PCAP_FILE_RECEIVED',
    PCAP_FILE_PROCESSED: 'PCAP_FILE_PROCESSED',
    PCAP_FILE_ANALYZING: 'PCAP_FILE_ANALYZING',
    PCAP_FILE_FAILED: 'PCAP_FILE_FAILED',
    PCAP_FILE_PROCESSING_DONE: 'PCAP_FILE_PROCESSING_DONE',
    PCAP_FILE_DELETED: 'PCAP_FILE_DELETED',
    IP_PARSED_FROM_SDP: 'IP_PARSED_FROM_SDP',
    SDP_VALIDATION_RESULTS: 'SDP_VALIDATION_RESULTS',

    //  {
    //      added: tbd,
    //      updated: tbd,
    //      removed: [ <source id> ],
    //  }
    LIVE_SOURCE_LIST_UPDATE: 'LIVE_SOURCE_LIST_UPDATE',
};

module.exports = deepFreeze(WS_EVENTS);
