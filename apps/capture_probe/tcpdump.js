const child_process = require('child_process');
const { StringDecoder } = require('string_decoder');
const _ = require('lodash');
const logger = require('./logger');

const buildTcpdumpInfo = (globalConfig, captureOptions) => {
    const interfaceName = _.get(globalConfig, ['capture', 'interfaces']);

    const tcpdumpFilter = captureOptions.endpoints
        ? `${captureOptions.endpoints.map(endpoint => {
              return endpoint.dstAddr ? 'dst ' + endpoint.dstAddr : '';
          })}`.replace(/,/g, ' or ')
        : '';

    const tcpdumpProgram = 'tcpdump';

    const snapshotLength = captureOptions.snapshotLengthBytes
        ? [`--snapshot-length=${captureOptions.snapshotLengthBytes}`]
        : [];

    const tcpdumpArguments = [
        '-i',
        interfaceName,
        '--time-stamp-precision=nano',
        '-j',
        'adapter_unsynced',
        ...snapshotLength,
        '-w',
        captureOptions.file,
        tcpdumpFilter,
    ];

    return {
        program: tcpdumpProgram,
        arguments: tcpdumpArguments,
        options: {},
    };
};

const buildSubscriberInfo = (globalConfig, captureOptions) => {
    const binPath = _.get(globalConfig, ['list', 'bin']);

    if (!binPath) {
        throw new Error(
            `Invalid global configuration. list.bin not found: ${JSON.stringify(globalConfig)}`
        );
    }

    const program = `${binPath}/subscribe_to`;

    const interfaceName = _.get(globalConfig, ['capture', 'interfaces']);

    const addresses = captureOptions.endpoints.map(endpoint => endpoint.dstAddr);
    const groups = addresses.map(a => ["-g", a.toString()]);
    const gargs = groups.reduce((acc, val) => acc.concat(val), []); // TODO: flat() in node.js 11
    console.log("gargs");
    console.dir(gargs);

    const arguments = [
        interfaceName,
        ...gargs
    ];

    return {
        program: program,
        arguments: arguments,
        options: {},
    };
};

// Returns a promise
const runTcpdump = async (globalConfig, captureOptions) => {

    const tcpdump = buildTcpdumpInfo(globalConfig, captureOptions);
    const subscriber = buildSubscriberInfo(globalConfig, captureOptions);

    return new Promise((resolve, reject) => {
        logger('live').info(
            `command line: ${tcpdump.program} ${tcpdump.arguments.join(' ')}`
        );

        const tcpdumpProcess = child_process.spawn(
            tcpdump.program,
            tcpdump.arguments,
            tcpdump.options
        );

        const subscriberProcess = child_process.spawn(
            subscriber.program,
            subscriber.arguments,
            subscriber.options
        );

        const tcpdumpOutput = [];
        const decoder = new StringDecoder('utf8');
        const appendToOutput = data => {
            tcpdumpOutput.push(decoder.write(data));
        };

        tcpdumpProcess.on('error', err => {
            logger('live').error(`error during capture:, ${err}`);
        });

        tcpdumpProcess.stdout.on('data', appendToOutput);
        tcpdumpProcess.stderr.on('data', appendToOutput);

        let timer = null;

        tcpdumpProcess.on('close', code => {
            logger('live').info(`child process exited with code ${code}`);

            const stdout = tcpdumpOutput.join('\n');

            logger('live').info(stdout);

            if (timer) {
                clearTimeout(timer);
            }

            if (killed) {
                resolve();
                return;
            }

            if (code == null || code !== 0) {
                const message = `tcpdump failed with code: ${code}`;
                logger('live').error(message);
                reject(new Error(message));
                return;
            }

            resolve();
        });

        let killed = false;
        const onTimeout = () => {
            killed = true;
            tcpdumpProcess.kill();
            subscriberProcess.kill();
        };

        timer = setTimeout(onTimeout, captureOptions.durationMs);
    });
};

module.exports = {
    runTcpdump,
};
