const types = {
    captureAndIngest: 'capture_and_ingest',
};

const status = {
    requested: 'requested',
    started: 'started',
    failed: 'failed', // payload : { message: string }
    completed: 'completed',
};

module.exports = {
    types,
    status,
};
