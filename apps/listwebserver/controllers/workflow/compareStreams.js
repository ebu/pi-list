const path = require('path');
const uuidv1 = require('uuid/v1');
const websocketManager = require('../../managers/websocket');
const WS_EVENTS = require('../../enums/wsEvents');
const COMPARISON_TYPES = require('../../enums/comparison');
const logger = require('../../util/logger');
const Stream = require('../../models/stream');
const StreamCompare = require('../../models/streamCompare');

const getConfig = async (inputConfig, folder) => {
    const main = await Stream.findOne({ id: inputConfig.mainStreamID }).exec();
    const ref = await Stream.findOne({ id: inputConfig.refStreamID }).exec();
    var config = {
        comparison_type: '',
        user_folder: folder,
        main: {
            pcap: main.pcap,
            stream: inputConfig.mainStreamID,
            media_type: main.media_type,
        },
        reference: {
            pcap: ref.pcap,
            stream: inputConfig.refStreamID,
            media_type: ref.media_type,
        },
        media_type: '',
        media_specific: {},
    };

    if (main.media_type === 'video' && ref.media_type === 'video') {
        if (main.media_specific.scan_type !== ref.media_specific.scan_type) {
            throw Error('video scan types are different: unsupported');
        }
        config.comparison_type = COMPARISON_TYPES.PSNR_AND_DELAY;
        config.media_type = main.media_type;
        config.media_specific = main.media_specific.scan_type;
    } else if (main.media_type === 'audio' && ref.media_type === 'audio') {
        if (
            main.media_specific.sampling !== ref.media_specific.sampling &&
            main.media_specific.encoding !== ref.media_specific.encoding &&
            main.media_specific.packet_time !== ref.media_specific.packet_time
        ) {
            throw Error('different audio format: unsupported');
        }
        config.main.channel = inputConfig.mainChannel;
        config.reference.channel = inputConfig.refChannel;
        config.main.first_packet_ts = main.statistics.first_packet_ts;
        config.reference.first_packet_ts = ref.statistics.first_packet_ts;
        config.comparison_type = COMPARISON_TYPES.CROSS_CORRELATION;
        config.media_type = main.media_type;
        config.media_specific = main.media_specific;
    } else {
        throw Error('media type unsupported');
    }

    return config;
};

const doCreateComparator = config => {
    /* Comparator modules must export the following functions:
    createComparator = (config)
    */
    const moduleName = `../../analyzers/${config.comparison_type}`;
    const module = require(moduleName);
    if (!module) {
        throw Error(`Unknown workflow type ${config.comparison_type}`);
    }

    const createFunction = module.createComparator;
    if (!createFunction) {
        throw Error(`Create function not exported for workflow ${config.comparison_type}`);
    }

    return createFunction(config);
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
        logger('compare-streams').info(`unsupported config ${err}`);
        workflowResponse.msg = `${name}: ${err.message}`;
        websocketManager.instance().sendEventToUser(userID, {
            event: WS_EVENTS.STREAM_COMPARE_FAILED,
            data: workflowResponse,
        });
        return;
    }

    const handleError = err => {
        workflowResponse.msg = `Could not compare ${name}`;
        websocketManager.instance().sendEventToUser(userID, {
            event: WS_EVENTS.STREAM_COMPARE_FAILED,
            data: workflowResponse,
        });
    };

    logger('compare-streams').info(`Config: ${JSON.stringify(compareConfig)}`);
    doCreateComparator(compareConfig)
        .then(data => {
            // insert in DB
            const id = uuidv1();
            StreamCompare.create(
                {
                    id: id,
                    name: name,
                    owner_id: userID,
                    date: Date.now(),
                    type: wf.type,
                    config: compareConfig,
                    result: data,
                },
                (err, instance) => {
                    if (err) {
                        return handleError(err);
                    }
                    //logger('compare-streams').info(`To mongo: ${JSON.stringify(instance)}`);
                    workflowResponse.compareId = id;
                    workflowResponse.msg = `${name}: success`;
                    websocketManager.instance().sendEventToUser(userID, {
                        event: WS_EVENTS.STREAM_COMPARE_COMPLETE,
                        data: workflowResponse,
                    });
                }
            );
        })
        .catch(err => handleError(err));
};

module.exports = {
    createWorkflow,
};
