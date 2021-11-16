const child_process = require('child_process');
const { StringDecoder } = require('string_decoder');
const _ = require('lodash');
const logger = require('./logger');

const runCapture = async (
    recorderProgram,
    recorderArguments,
    recorderOptions,
    maxDurationMs
) => {
    return new Promise((resolve, reject) => {
        logger('live').info(
            `command line: ${recorderProgram} ${recorderArguments.join(' ')}`
        );

        const recorderProcess = child_process.spawn(
            recorderProgram,
            recorderArguments,
            recorderOptions
        );

        const recorderOutput = [];
        const decoder = new StringDecoder('utf8');
        const appendToOutput = data => {
            recorderOutput.push(decoder.write(data));
        };

        recorderProcess.on('error', err => {
            logger('live').error(`error during capture:, ${err}`);
        });

        recorderProcess.stdout.on('data', appendToOutput);
        recorderProcess.stderr.on('data', appendToOutput);

        let timer = null;

        recorderProcess.on('close', code => {
            logger('live').info(`child process exited with code ${code}`);

            const stdout = recorderOutput.join('\n');

            logger('live').info(stdout);

            if (timer) {
                clearTimeout(timer);
            }

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
            killed = true;
            recorderProcess.kill();
        };

        timer = setTimeout(onTimeout, maxDurationMs);
    });
};

// Returns a promise
const runRecorder = async (globalConfig, captureOptions) => {
    const interfaceName = _.get(globalConfig, ['interfaces']);
    const recorderBinPath = _.get(globalConfig, ['list', 'bin']);

    if (!recorderBinPath) {
        throw new Error(
            `Invalid global configuration. list.bin not found: ${JSON.stringify(globalConfig)}`
        );
    }

    const endpoints = [];
    captureOptions.endpoints.forEach(endpoint => {
        endpoints.push('-e');
        endpoints.push(`${endpoint.dstAddr}:${endpoint.dstPort}`);
    });

    const captureEnv = {
        LD_PRELOAD: 'libvma.so',
        VMA_HW_TS_CONVERSION: '4',
    };

    const recorderProgram = `${recorderBinPath}/recorder`;
    const recorderOptions = {
        env: Object.assign({}, { ...process.env }, { ...captureEnv }),
    };

    const duration = ['-d', captureOptions.durationMs];

    const recorderArguments = [
        interfaceName,
        captureOptions.file,
        '-t',
        '3', // TODO: review thread affinity
        ...endpoints,
        ...duration,
    ];

    const maxDurationMs = captureOptions.durationMs * 3 + 10000;
    await runCapture(recorderProgram, recorderArguments, recorderOptions, maxDurationMs);
};

module.exports = {
    runRecorder,
};
