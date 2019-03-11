const child_process = require('child_process');
const textEncoding = require('text-encoding');
const TextDecoder = textEncoding.TextDecoder;
const logger = require('../../util/logger');
const program = require('../../util/programArguments');

// Returns a promise
function runRecorder(captureOptions) {
    return new Promise(function (resolve, reject) {
        if(!captureOptions.streamEndpoints) {
            reject(`No endpoints: ${JSON.stringify(captureOptions.streamEndpoints)}`);
            return;
        }

        const endpoints = [];
        const es = captureOptions.streamEndpoints.forEach(endpoint => {
            endpoints.push('-e');
            endpoints.push(`${endpoint.dstAddr}:${endpoint.dstPort}`);
        });

        const captureEnv = {
            LD_PRELOAD: 'libvma.so',
            VMA_HW_TS_CONVERSION: '4'
        };

        const recorderProgram = `${program.cpp}/recorder`;
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
        const appendToOutput = (data) => {
            recorderOutput.push(new TextDecoder("utf-8").decode(data));
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
                reject(message);
                return;
            }

            if (code == null || code !== 0) {
                const message = `recorder failed with code: ${code}`;
                logger('live').error(message);
                reject(message);
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
