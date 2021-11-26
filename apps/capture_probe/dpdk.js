const child_process = require('child_process');
const { StringDecoder } = require('string_decoder');
const _ = require('lodash');
const logger = require('./logger');

const buildDpdkInfo = (globalConfig, captureOptions) => {
    const dpdkProgram = 'dpdk-capture.sh';
    const dpdkFilter = captureOptions.endpoints
        ? `${captureOptions.endpoints.map(endpoint => {
              return endpoint.dstAddr ? 'dst ' + endpoint.dstAddr : '';
          })}`.replace(/,/g, ' or ')
        : '';
    var interfaces = _.get(globalConfig, ['capture', 'interfaces']).split(',');

    if (interfaces.length == 0) {
        logger('live').info('no interface for capure');
        return;
    }
    var pos = 0;
    while (pos < interfaces.length) {
        interfaces.splice(pos, 0, '-i');
        pos += 2;
    }

    const dpdkArguments = interfaces.concat( [
        '-w',
        captureOptions.file,
        '-G',
        (captureOptions.durationMs/1000).toString(),
        '-W',
        '1',
        dpdkFilter,
    ]);
    console.log(dpdkArguments);

    return {
        program: dpdkProgram,
        arguments: dpdkArguments,
        options: {},
    };
};

// Returns a promise
const runDpdkCapture = async (globalConfig, captureOptions) => {

    const dpdk = buildDpdkInfo(globalConfig, captureOptions);

    return new Promise((resolve, reject) => {
        logger('live').info(
            `command line: ${dpdk.program} ${dpdk.arguments.join(' ')}`
        );

        const dpdkProcess = child_process.spawn(
            dpdk.program,
            dpdk.arguments,
            dpdk.options
        );

        const dpdkOutput = [];
        const decoder = new StringDecoder('utf8');
        const appendToOutput = data => {
            dpdkOutput.push(decoder.write(data));
        };

        dpdkProcess.on('error', err => {
            logger('live').error(`error during capture:, ${err}`);
        });

        dpdkProcess.stdout.on('data', appendToOutput);
        dpdkProcess.stderr.on('data', appendToOutput);

        let timer = null;

        dpdkProcess.on('close', code => {
            logger('live').info(`child process exited with code ${code}`);

            const stdout = dpdkOutput.join('\n');

            logger('live').info(stdout);

            if (timer) {
                clearTimeout(timer);
            }

            if (killed) {
                logger('live').error('killed');
                resolve(0);
                return;
            }

            if (code == null || code !== 0) {
                const message = `dpdk-capture failed with code: ${code}`;
                logger('live').error(message);
                if (code == 2) { /* retry */
                    resolve(code);
                } else {
                    reject(new Error(message));
                }
                return;
            }

            resolve(0);
        });

        let killed = false;
        const onTimeout = () => {
            killed = true;
            //dpdkProcess.kill();
        };

        timer = setTimeout(onTimeout, captureOptions.durationMs * 2);
    });
};

module.exports = {
    runDpdkCapture,
};
