const child_process = require('child_process');
const textEncoding = require('text-encoding');
const TextDecoder = textEncoding.TextDecoder;
const logger = require('../../util/logger');
const program = require('../../util/programArguments');

const getDropInfo = (stdout) => {
    const kernel_regex = /(\d+) *packets dropped by kernel/m;
    const kernel_found = stdout.match(kernel_regex);
    const kernel = kernel_found ? parseInt(kernel_found[1]) : 0;

    const interface_regex = /(\d+) *packets dropped by interface/m;
    const interface_found = stdout.match(interface_regex);
    const interface = interface_found ? parseInt(interface_found[1]) : 0;

    return { kernel, interface };
};

// Returns a promise
function runTcpdump(captureOptions) {
    return new Promise(function (resolve, reject) {
        const snapshotLength = captureOptions.snapshotLengthBytes
            ? [`--snapshot-length=${captureOptions.snapshotLengthBytes}`]
            : [];

        // tcpdump filter must be like "dst XXX.XXX.XXX.XXX or dst YYY.YYY.YYY.YYY or ..."
        const tcpdumpFilter = captureOptions.streamEndpoints ?
            `${
                captureOptions.streamEndpoints.map(stream => {
                    return stream.dstAddr ? "dst " + stream.dstAddr : '';
                })
                }`.replace(/,/g, ' or ')
            : '';

        const tcpdumpProgram = '/usr/sbin/tcpdump';
        const tcpdumpOptions = {};

        const tcpdumpArguments = [
            "-i", captureOptions.interfaceName,
            "--time-stamp-precision=nano",
            "-j", "adapter_unsynced",
            "-c", "5000000",
            ...snapshotLength,
            "-w", captureOptions.file,
            tcpdumpFilter
        ];

        console.log(`${tcpdumpProgram} ${tcpdumpArguments.join(' ')}`);

        const tcpDumpProcess = child_process.spawn(tcpdumpProgram,
            tcpdumpArguments,
            tcpdumpOptions
        );

        const tcpdumpOutput = [];
        const appendToOutput = (data) => {
            tcpdumpOutput.push(new TextDecoder("utf-8").decode(data));
        };

        tcpDumpProcess.on('error', (err) => {
            logger('live').error(`error during capture:, ${err}`);
        });

        tcpDumpProcess.stdout.on('data', appendToOutput);
        tcpDumpProcess.stderr.on('data', appendToOutput);

        tcpDumpProcess.on('close', (code) => {
            logger('live').info(`child process exited with code ${code}`);

            const stdout = tcpdumpOutput.join('\n');

            const dropInfo = getDropInfo(stdout);

            logger('live').info('Drop info:', dropInfo);
            logger('live').info(stdout);

            clearTimeout(timer);

            if (code < 0) {
                const message = `tcpdump failed with code: ${code}`;
                logger('live').error(message);
                reject(message);
                return;
            }

            if (dropInfo.kernel > 0 || dropInfo.interface > 0) {
                const message = `Dropped packets: dropInfo.kernel: ${dropInfo.kernel} | dropInfo.interface: ${dropInfo.interface}`;
                logger('live').error(message);
                reject(message);
                return;
            }

            resolve();
        });

        // subscribe
        const subscribeToProgram = `${program.cpp}/subscribe_to`;
        const subscribeToOptions = {};
        const addressSubscription = [];
        captureOptions.streamEndpoints.forEach(s => {
            addressSubscription.push('-g', s.dstAddr);
        });

        const subscribeToArguments = [
            captureOptions.interfaceName,
            ...addressSubscription
        ];

        logger('live').info(`${subscribeToProgram} ${subscribeToArguments.join(' ')}`);

        const subscribeToProcess = child_process.spawn(subscribeToProgram,
            subscribeToArguments,
            subscribeToOptions
        );

        subscribeToProcess.on('error', (err) => {
            logger('live').error(`error during subscription:, ${err}`);
        });

        subscribeToProcess.on('close', (code) => {
            logger('live').info(`subscribeTo process exited with code ${code}`);
        });

        let killed = false;
        const onTimeout = () => {
            console.log('onTimeout');
            killed = true;
            tcpDumpProcess.kill();
            subscribeToProcess.kill();
        };

        const timer = setTimeout(onTimeout, captureOptions.durationMs);
    });
}

module.exports = {
    runTcpdump
};
