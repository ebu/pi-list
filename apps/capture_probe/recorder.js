const child_process = require('child_process');
const { StringDecoder } = require('string_decoder');
const logger = require('./logger');

// Returns a promise
function runRecorder(recorderBinPath, captureOptions) {
    return new Promise(function (resolve, reject) {
        if(!captureOptions.endpoints
            || !captureOptions.durationMs
            || !captureOptions.interfaceName
            || !captureOptions.file
        ) {
            reject(new Error(`Invalid configuration: ${JSON.stringify(captureOptions.endpoints)}`));
            return;
        }

        const endpoints = [];
        const es = captureOptions.endpoints.forEach(endpoint => {
            endpoints.push('-e');
            endpoints.push(`${endpoint.dstAddr}:${endpoint.dstPort}`);
        });

        const captureEnv = {
            LD_PRELOAD: 'libvma.so',
            VMA_HW_TS_CONVERSION: '4'
        };

        const recorderProgram = `${recorderBinPath}/recorder`;
        const recorderOptions = {
            env: Object.assign({}, { ...process.env }, { ...captureEnv })
        };

        const duration = [ '-d', captureOptions.durationMs];

        const recorderArguments = [
            captureOptions.interfaceName,
            captureOptions.file,
            "-t", "3", // TODO: review thread affinity
            ...endpoints,
            ...duration
        ];

        console.log(`${recorderProgram} ${recorderArguments.join(' ')}`);

        const recorderProcess = child_process.spawn(recorderProgram,
            recorderArguments,
            recorderOptions
        );

        const recorderOutput = [];
        const decoder = new StringDecoder('utf8');
        const appendToOutput = (data) => {
            recorderOutput.push(decoder.write(data));
        };

        recorderProcess.on('error', (err) => {
            logger('live').error(`error during capture:, ${err}`);
        });

        recorderProcess.stdout.on('data', appendToOutput);
        recorderProcess.stderr.on('data', appendToOutput);

        recorderProcess.on('close', (code) => {
            logger('live').info(`child process exited with code ${code}`);

            const stdout = recorderOutput.join('\n');

            logger('live').info(stdout);

            clearTimeout(timer);

            if (killed) {
                const message = 'recorder timed out';
                logger('live').error(message);
                reject(new Error(message));
                return;
            }

            if (code == null || code !== 0) {
                const message = `recorder failed with code: ${code}`;
                logger('live').error(message);
                reject(new Error(message));
                return;
            }

            resolve();
        });

        let killed = false;
        const onTimeout = () => {
            console.log('onTimeout');
            killed = true;
            recorderProcess.kill();
        };

        const timer = setTimeout(onTimeout, captureOptions.durationMs * 3 + 10000);
    });
}

module.exports = {
    runRecorder
};
