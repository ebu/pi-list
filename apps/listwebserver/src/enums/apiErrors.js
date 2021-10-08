/**
 * Enum for API errors that will be used to report problems as error responses
 */

const deepFreeze = require('deep-freeze');

const API_ERRORS = {
    // LOGIN ERROR CODES
    USER_NOT_AUTHENTICATED: {
        code: 'USER_NOT_AUTHENTICATED',
        message: 'User not authenticated. Please login in using the sign-in requests or LIST web application'
    },

    USER_DOES_NOT_EXIST: {
        code: 'USER_DOES_NOT_EXIST',
        message: 'This e-mail does not exist in our system. Please register!'
    },

    TOKEN_EXPIRED: {
        code: 'TOKEN_EXPIRED',
        message: 'The token which was used for the login process was expired.'
    },

    INVALID_CREDENTIALS: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid login credentials. Invalid e-mail or password.'
    },

    USER_ALREADY_REGISTERED: {
        code: 'USER_ALREADY_REGISTERED',
        message: 'The e-mail is already registered in our system.'
    },

    // PCAP ERROR CODES
    PCAP_FILE_TO_UPLOAD_NOT_FOUND: {
        coe: 'PCAP_FILE_TO_UPLOAD_NOT_FOUND',
        message: 'The PCAP file was not received. Please upload again.'
    },
    PCAP_FILE_TO_UPLOAD_FAILED: {
        code: 'PCAP_FILE_TO_UPLOAD_FAILED',
        message: 'Something went wrong during the PCAP upload.'
    },
    PCAP_EXTRACT_METADATA_ERROR: {
        code: 'PCAP_EXTRACT_METADATA_ERROR',
        message: 'Something went wrong during the PCAP metadata extraction.'
    },

    // SDP ERROR CODES
    SDP_INVALID_MEDIA_TYPE_VALUE: {
        code: 'INVALID_MEDIA_TYPE_VALUE',
        message: 'LIST only accepts as media_type the following values: [ "video" ]'
    },
    SDP_VIDEO_OPTIONS_NOT_FOUND: {
        code: 'SDP_VIDEO_OPTIONS_NOT_FOUND',
        message: 'The available options file for video do not exist.'
    },
    SDP_AVAILABLE_OPTIONS_NOT_FOUND: {
        code: 'SDP_AVAILABLE_OPTIONS_NOT_FOUND',
        message: 'The available options file for SDP do not exist.'
    },

    // GENERIC ERROR CODES
    RESOURCE_NOT_FOUND: {
        code: 'RESOURCE_NOT_FOUND',
        message: 'The resource that you tried to access does not exist.'
    },
    UNEXPECTED_ERROR: {
        code: 'UNEXPECTED_ERROR',
        message: 'An unexpected error occurred. Logs may contain relevant information.'
    }
};

module.exports = deepFreeze(API_ERRORS);
