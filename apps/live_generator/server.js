#!/usr/bin/env node

/*
For information about the configuration file, see config.yml
*/

const _ = require('lodash');
const uuid = require('uuid');
const logger = require('../../js/common_server/logging/logger');
const mq = require('../../js/common/mq/types');
const { createExchangeSender } = require('../../js/common_server/mq/send');

///////////////////////////////////////////////////////////////////////////////

const commander = require('commander');
const yamlParser = require('read-yaml');

commander
    .arguments('<configFile>')
    .action((configFile) => {
        globalConfig = yamlParser.sync(configFile);

        if (globalConfig.rabbitmq.hostname === undefined || globalConfig.rabbitmq.port === undefined) {
            console.error('RabbitMQ is not configured in config file');
            process.exit(-1);
        }

        globalConfig.rabbitmqUrl = `amqp://${globalConfig.rabbitmq.hostname}:${globalConfig.rabbitmq.port}`;
    })
    .parse(process.argv);

if (typeof globalConfig === 'undefined') {
    console.error('no config file given!');
    process.exit(1);
}

///////////////////////////////////////////////////////////////////////////////

logger('server').info(`Starting server`);
logger('server').info(`Connecting to ${globalConfig.rabbitmqUrl}`);

///////////////////////////////////////////////////////////////////////////////

function randn_bm() {
    var u = 0,
        v = 0;
    while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) return randn_bm(); // resample between 0 and 1
    return num;
}

const getRandomIntInclusive = (min, max) => {
    const x = randn_bm();
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(x * (max - min + 1)) + min;
};

const generatorSettings = {
    cInst: {
        min: 0,
        max: 6,
    },
    vrx: {
        min: 3,
        max: 7,
    },
};

const initialContext = {
    current: {
        cInst: {
            samples: {},
            histogram: {},
        },
        vrx: {
            samples: {},
            histogram: {},
        },
    },
    global: {
        cInst: {
            samples: {},
            histogram: {},
        },
        vrx: {
            samples: {},
            histogram: {},
        },
    },
    lastCleared: undefined,
};

const getHistogram = (samples) => {
    const total = Object.values(samples).reduce((t, value) => t + value, 0);
    const histogram = Object.keys(samples).map((key) => [parseInt(key), (100 * samples[key]) / total]);
    return histogram;
};

const incrementValue = (map, index) => {
    if (_.isNil(map[index])) {
        map[index] = 1;
    } else {
        map[index] = map[index] + 1;
    }
};

const updateCinst = (context, settings) => {
    const cInst = getRandomIntInclusive(settings.cInst.min, settings.cInst.max);

    incrementValue(context.current.cInst.samples, cInst);
    incrementValue(context.global.cInst.samples, cInst);

    context.current.cInst.histogram = getHistogram(context.current.cInst.samples);
    context.global.cInst.histogram = getHistogram(context.global.cInst.samples);
};

const updateVrx = (context, settings) => {
    const vrx = getRandomIntInclusive(settings.vrx.min, settings.vrx.max);

    incrementValue(context.current.vrx.samples, vrx);
    incrementValue(context.global.vrx.samples, vrx);

    context.current.vrx.histogram = getHistogram(context.current.vrx.samples);
    context.global.vrx.histogram = getHistogram(context.global.vrx.samples);
};

const clearCurrentValues = (context) => {
    if (_.isNil(context.lastCleared) || context.lastCleared + 1000 < Date.now()) {
        context.current = _.cloneDeep(initialContext.current);
    }

    return context;
};

const run = async () => {
    const heartBeatSender = createExchangeSender(globalConfig.rabbitmqUrl, mq.exchanges.liveStreamUpdates);

    const onProcessClosed = () => {
        logger('server').info(`Closing server`);
        clearInterval(timer);
        heartBeatSender.close();
    };

    process.on('SIGINT', onProcessClosed);

    const streamId = uuid.v1();

    logger('live-generator').info(`Generating stream ${streamId}`);

    const context = _.cloneDeep(initialContext);

    const data = {
        current_video_analysis: {
            cinst: {
                cmax_narrow: 4,
                cmax_wide: 16,
                compliance: 'narrow',
                histogram: [],
            },
            compliance: 'narrow',
            vrx: {
                compliance: 'narrow',
                histogram: [],
                vrx_full_narrow: 8,
                vrx_full_wide: 720,
            },
        },
        global_video_analysis: {
            cinst: {
                cmax_narrow: 4,
                cmax_wide: 16,
                compliance: 'narrow',
                histogram: [],
            },
            compliance: 'narrow',
            vrx: {
                compliance: 'narrow',
                histogram: [],
                vrx_full_narrow: 8,
                vrx_full_wide: 720,
            },
        },
        id: streamId,
        media_specific: {
            color_depth: 10,
            colorimetry: 'BT709',
            height: 1080,
            packets_per_frame: 2160,
            rate: '60000/1001',
            sampling: 'YCbCr-4:2:2',
            scan_type: 'interlaced',
            schedule: 'gapped',
            width: 1920,
            avg_tro_ns: 615145,
            max_tro_ns: 621984,
            min_tro_ns: 606720,
            tro_default_ns: 652504,
        },
        media_type: 'video',
        network_information: {
            destination_address: '239.0.1.4',
            destination_mac_address: '00:00:00:00:00:00',
            destination_port: '50000',
            multicast_address_match: false,
            payload_type: 96,
            source_address: '192.168.1.212',
            source_mac_address: '00:00:00:00:00:00',
            source_port: '50000',
            ssrc: 0,
            valid_multicast_ip_address: true,
            valid_multicast_mac_address: false,
        },
        pcap: '',
        state: 'on_going_analysis',
        statistics: {
            dropped_packet_count: 0,
            first_frame_ts: 7510,
            first_packet_ts: '1516906244254007000',
            frame_count: 60,
            is_interlaced: true,
            last_frame_ts: 97630,
            last_packet_ts: '1516906245255127000',
            max_line_number: -1,
            packet_count: 129599,
            rate: 60000 / 1001,
        },
    };

    const updateData = (data, context) => {
        data.current_video_analysis.cinst.histogram = context.current.cInst.histogram;
        data.global_video_analysis.cinst.histogram = context.global.cInst.histogram;
        data.current_video_analysis.vrx.histogram = context.current.vrx.histogram;
        data.global_video_analysis.vrx.histogram = context.global.vrx.histogram;
    };

    const timer = setInterval(async () => {
        try {
            clearCurrentValues(context);
            _.times(100, () => {
                updateCinst(context, generatorSettings);
                updateVrx(context, generatorSettings);
                updateData(data, context);
            });

            await heartBeatSender.send({
                key: mq.exchanges.liveStreamUpdates.topics.stream_update + `.${streamId}`,
                msg: data,
            });
        } catch (err) {
            logger('server').error(`Error sending announce message: ${err}`);
        }
    }, 200);
};

run().catch((err) => {
    logger('server').error(`Error: ${err}`);
    process.exit(-1);
});
