const uuidv1 = require('uuid/v1');
const path = require('path');
const tmp = require('tmp');
const fs = require('fs');
const { promisify } = require('util');
const websocketManager = require('../../managers/websocket');
const WS_EVENTS = require('../../enums/wsEvents');
const logger = require('../../util/logger');
const Stream = require('../../models/stream');
const Pcap = require('../../models/pcap');
const StreamCompare = require('../../models/streamCompare');
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const child_process = require('child_process');
const exec = promisify(child_process.exec);
const program = require('../../util/programArguments');

// async
const tmpFile = () => {
    return new Promise((resolve, reject) => {
        tmp.file((err, path, fd, cleanupCallback) => {
            if (err) reject(err);
            resolve(path);
        });
    });
};

const getStreamInfo = async (streamId, folder) => {
    const stream = await Stream.findOne({ id: streamId }).exec();
    const pcap = await Pcap.findOne({ id: stream.pcap }).exec();
    const pcap_file = path.join(folder, pcap.id, pcap.pcap_file_name);

    const network_information = {
        destination_address: stream.network_information.destination_address,
        destination_port: stream.network_information.destination_port,
        source_address: stream.network_information.source_address,
    };

    return {
        pcap_file: pcap_file,
        network_information: network_information,
        pcap: pcap.id,
        stream: streamId,
        media_type: stream.media_type,
    };
};

const getConfig = async (inputConfig, folder) => {
    const reference = await getStreamInfo(inputConfig.refStreamID, folder);
    const main = await getStreamInfo(inputConfig.mainStreamID, folder);

    return {
        reference: reference,
        main: main,
    };
};

// Returns a promise that resolves when the comparison finishes, either with success or failure.
const runComparison = async config => {
    const requestFile = await tmpFile();
    const responseFile = await tmpFile();

    try {
        await writeFile(requestFile, JSON.stringify(config));

        const analyzerCommand = `"${program.cpp}/st2022_7_analysis" ${requestFile} ${responseFile}`;

        logger('st2022-7-analysis').info(`Command: ${analyzerCommand}`);

        const output = await exec(analyzerCommand);
        logger('st2022-7-analysis').info(output.stdout);
        logger('st2022-7-analysis').info(output.stderr);

        const data = await readFile(responseFile);
        const result = JSON.parse(data);
        return result;
    } catch (e) {
        logger('st2022-7-analysis').error(e);
    }
};

const createWorkflow = async (wf, inputConfig, workSender) => {
    const userID = wf.meta.createdBy;
    const name = inputConfig.name;
    var compareConfig;
    var workflowResponse = {
        id: wf.id,
        date: Date.now(),
        msg: '',
    };

    try {
        compareConfig = await getConfig(inputConfig, wf.meta.folder);
    } catch (err) {
        logger('st2022-7-analysis').info(`unsupported config ${err}`);
        workflowResponse.msg = `${name}: ${err.message}`;
        websocketManager.instance().sendEventToUser(userID, {
            event: WS_EVENTS.STREAM_COMPARE_FAILED,
            data: workflowResponse,
        });
        return;
    }

    const handleError = err => {
        workflowResponse.msg = `Could not run the analysis ${name}`;
        websocketManager.instance().sendEventToUser(userID, {
            event: WS_EVENTS.STREAM_COMPARE_FAILED,
            data: workflowResponse,
        });
    };

    const notifyCompleteAnalysis = () => {
        workflowResponse.compareId = wf.id;
        workflowResponse.msg = `${name}: success`;
        websocketManager.instance().sendEventToUser(userID, {
            event: WS_EVENTS.STREAM_COMPARE_COMPLETE,
            data: workflowResponse,
        });
    };

    const completeAnalysis = result => {
        const id = uuidv1();
        StreamCompare.create(
            {
                id: id,
                name: name,
                owner_id: userID,
                date: Date.now(),
                type: wf.type,
                config: compareConfig,
                result: result,
            },
            (err, instance) => {
                if (err) {
                    return handleError(err);
                }
                notifyCompleteAnalysis();
            }
        );
    };

    logger('st2022-7-analysis').info(`Config: ${JSON.stringify(compareConfig)}`);

    runComparison(compareConfig)
        .then(result => {
            completeAnalysis(result);
        })
        .catch(err => handleError(err));
};

module.exports = {
    createWorkflow,
};
