const types = {
    /**
     * ingestPutUrl : string // where to upload the captured pcap
     * cookie : string // cookie to authenticate in the HTTP PUT
     * filename : string // the name of the capture file
     * senders : array of Sender // what sources to capture
     * durationMs : number // the duration of the capture, in milliseconds
     */
    captureAndIngest: 'captureAndIngest',
    /*
     **/
    downloadMultipleFiles: 'downloadMultipleFiles',
};

module.exports = {
    types,
};
