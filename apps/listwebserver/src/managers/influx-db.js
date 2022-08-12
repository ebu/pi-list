const Influx = require('influx');
import {
    isArray
} from 'lodash';
import logger from '../util/logger';
const program = require('../util/programArguments');

const log = logger('influx-db-manager');

class InfluxDbManager {
    constructor() {
        log.info('Starting Influx DB Manager');

        if (program.influxURL === '') {
            log.warn('Influx DB configurations are not available in the configuration file.');
            return;
        }

        this.influx = new Influx.InfluxDB({
            host: program.influx.hostname,
            port: program.influx.port,
            database: 'LIST',
        });

        log.info(`Influx DB Manager connect to ${program.influxURL}`);
    }

    fromPcapIdWhereStreamIs(pcapID, streamID) {
        return `from /^${pcapID}$/ where ("stream" =~ /^"${streamID}"$/)`;
    }

    timeFilter(startTime, endTime) {
        return `time >= ${startTime}ns and time <= ${endTime}ns`;
    }

    timeGroupFilter(startTime, endTime, groupTime) {
        return `time >= ${startTime}ns and time <= ${endTime}ns group by time(${groupTime}ns)`;
    }

    sendQueryAndFormatResults(query, isGrouped) {
        return this.influx.query(query).then((data) =>
            ({
                data: data.map((item) => ({
                    ...item,
                    time: item.time._nanoISO,
                })),
                isGrouped: isGrouped
            })
        );
    }

    sendQueryAndCountResults(query) {
        return this.influx.query(query).then((data) =>
            (data && isArray(data) && data[0]) ? ({
                count: data[0].count
            }) : {
                count: 0
            }
        );
    }

    getPtpOffsetSamplesByPcap(pcapID) {
        const query = `select "ptp_offset" as "value" from /^${pcapID}$/`;
        log.info(`Get PTP for the pcap ${pcapID}. Query: \n ${query}`);
        return this.sendQueryAndFormatResults(query, false);
    }

    getCInstRange(pcapID, streamID) {
        const query = `
            select max("cinst") as "max", min("cinst") as "min", mean("cinst") as "avg"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)}
        `;

        log.info(`Get CInst for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query, false);
    }

    getCInstRaw(pcapID, streamID, startTime, endTime) {
        const wanted_resolution = Math.ceil((endTime - startTime) / 2000);
        const resolution = wanted_resolution <= 1 ? '1ms' : `${wanted_resolution}ms`;
        const query = `
            select max("cinst")
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} and ${this.timeFilter(startTime, endTime)}
            group by time(1ms)
        `;

        log.info(`Get CInst for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query, false);
    }

    getCInstGrouped(pcapID, streamID, startTime, endTime, groupTime) {
        const query = `
            select  max("cinst") as "max", min("cinst") as "min", mean("cinst") as "avg"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} and ${this.timeGroupFilter(startTime, endTime, groupTime)}
        `;

        log.info(`Get CInst for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query, true);
    }

    getCInstCount(pcapID, streamID) {
        const query = `
        select count(max) as "count" from (
            select max("cinst")
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} group by time(1ms))
        `;

        log.info(`Get CInst for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndCountResults(query);
    }

    getCInstByStream(pcapID, streamID, startTime, endTime) {
        const wanted_resolution = Math.ceil((endTime - startTime) / 2000);
        const resolution = wanted_resolution <= 1 ? '1ns' : `${wanted_resolution}ns`;
        const query = `
            select max("cinst")
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} and ${this.timeFilter(startTime, endTime)}
            group by time(${resolution})
        `;

        log.info(`Get CInst for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query, false);
    }

    getVrxIdeal(pcapID, streamID, startTime, endTime, groupByNanoseconds) {
        const groupBy = groupByNanoseconds ? `group by time(${groupByNanoseconds}ns)` : 'group by time(2ms)';
        const query = `
            select max("gapped-ideal-vrx")
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} and ${this.timeFilter(startTime, endTime)}
            ${groupBy}
        `;

        log.info(`Get VRX Ideal for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query, false);
    }

    getVrxIdealRaw(pcapID, streamID, startTime, endTime) {
        const query = `
            select max("gapped-ideal-vrx")
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} and ${this.timeFilter(startTime, endTime)}
            group by time(2ms)
        `;

        log.info(`Get VRX Ideal in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query, false);
    }

    getVrxIdealGrouped(pcapID, streamID, startTime, endTime, groupTime) {
        const query = `
            select max("gapped-ideal-vrx") as "max", min("gapped-ideal-vrx") as "min", mean("gapped-ideal-vrx") as "avg"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} and ${this.timeGroupFilter(startTime, endTime, groupTime)}
        `;

        log.info(`Get VRX Ideal Grouped in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query, true);
    }

    getVrxIdealCount(pcapID, streamID) {
        const query = `
        select count(max) as "count" from (
            select max("gapped-ideal-vrx")
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} group by time(2ms))
        `;

        log.info(`Get DeltaToPreviousRtpTsRaw for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndCountResults(query);
    }

    getDeltaToIdealTpr0Raw(pcapID, streamID, startTime, endTime) {
        const query = `
            select "gapped-ideal-delta_to_ideal_tpr0" as "value"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} and ${this.timeFilter(startTime, endTime)}
        `;

        log.info(`Get DeltaToIdealTpr0 for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);


        return this.sendQueryAndFormatResults(query, false);;
    }

    getDeltaToIdealTpr0Grouped(pcapID, streamID, startTime, endTime, groupTime) {
        const query = `
            select  max("gapped-ideal-delta_to_ideal_tpr0") as "max", min("gapped-ideal-delta_to_ideal_tpr0") as "min", mean("gapped-ideal-delta_to_ideal_tpr0") as "avg"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} and ${this.timeGroupFilter(startTime, endTime, groupTime)}
        `;

        log.info(`Get DeltaToIdealTpr0 grouped for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query, true);
    }


    getDeltaToIdealTpr0Count(pcapID, streamID) {
        const query = `
            select count("gapped-ideal-delta_to_ideal_tpr0") as "count"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)}
        `;

        log.info(`Get DeltaToPreviousRtpTsRaw for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndCountResults(query);
    }


    getDeltaRtpTsVsPacketTsRaw(pcapID, streamID, startTime, endTime) {
        const query = `
            select "delta_rtp_vs_packet_time" as "value"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} and ${this.timeFilter(startTime, endTime)}
        `;

        log.info(`Get DeltaRtpTsVsPacketTs for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query, false);
    }

    getDeltaRtpTsVsPacketTsGrouped(pcapID, streamID, startTime, endTime, groupTime) {
        const query = `
            select  max("delta_rtp_vs_packet_time") as "max", min("delta_rtp_vs_packet_time") as "min", mean("delta_rtp_vs_packet_time") as "avg"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} and ${this.timeGroupFilter(startTime, endTime, groupTime)}
        `;

        log.info(`Get DeltaRtpTsVsPacketTs grouped for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query, true);
    }

    getDeltaRtpTsVsPacketTsCount(pcapID, streamID) {
        const query = `
            select count("delta_rtp_vs_packet_time") as "count"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)}
        `;

        log.info(`Get DeltaToPreviousRtpTsRaw for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndCountResults(query);
    }

    getDeltaPacketTimeVsRtpTimeRaw(pcapID, streamID, startTime, endTime) {
        const query = `
            select "delta_packet_time_vs_rtp_time_ns" as "value"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} and ${this.timeFilter(startTime, endTime)}
        `;

        log.info(
            `Get DeltaPacketTimeVsRtpTimeRaw for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`
        );

        return this.sendQueryAndFormatResults(query, false);
    }

    getDeltaPacketTimeVsRtpTimeGrouped(pcapID, streamID, startTime, endTime, groupTime) {
        const query = `
            select max("delta_packet_time_vs_rtp_time_ns") as "max", min("delta_packet_time_vs_rtp_time_ns") as "min", mean("delta_packet_time_vs_rtp_time_ns") as "avg"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} and ${this.timeGroupFilter(startTime, endTime, groupTime)}
        `;

        log.info(`Get Delta PAcket Time Vs Rtp Time for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query, true);
    }

    getDeltaPacketTimeVsRtpTimeCount(pcapID, streamID) {
        const query = `
            select count("delta_packet_time_vs_rtp_time_ns") as "count"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)}
        `;

        log.info(`Get DeltaToPreviousRtpTsRaw for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndCountResults(query);
    }

    getDeltaPacketTimeVsRtpTimeMinMax(pcapID, streamID) {
        const query = `
            select max("delta_packet_time_vs_rtp_time_ns") as "max", min("delta_packet_time_vs_rtp_time_ns") as "min", mean("delta_packet_time_vs_rtp_time_ns") as "avg"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)}`;

        log.info(
            `Get DeltaPacketTimeVsRtpTimeMinMax for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`
        );

        return this.sendQueryAndFormatResults(query, true);
    }

    getDeltaRtpVsNt(pcapID, streamID, startTime, endTime) {
        const wanted_resolution = Math.ceil((endTime - startTime) / 2000);
        const resolution = wanted_resolution <= 1 ? '1ns' : `${wanted_resolution}ns`;
        const query = `
            select "delta_rtp_vs_NTs" as "value"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} and ${this.timeFilter(startTime, endTime)}
        `;

        log.info(`Get DeltaRtpTsVsPacketTs for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query, false);
    }

    getDeltaRtpVsNtTicksMinMax(pcapID, streamID) {
        const query = `
            select max("delta_rtp_vs_NTs") as "max", min("delta_rtp_vs_NTs") as "min", mean("delta_rtp_vs_NTs") as "avg"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)}`;

        log.info(`Get DeltaRtpVsNtTicksMinMax for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query, true);
    }

    getDeltaRtpVsNtGrouped(pcapID, streamID, startTime, endTime, groupTime) {
        const query = `
            select max("delta_rtp_vs_NTs") as "max", min("delta_rtp_vs_NTs") as "min", mean("delta_rtp_vs_NTs") as "avg"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} and ${this.timeGroupFilter(startTime, endTime, groupTime)}`;

        log.info(`Get DeltaRtpVsNtGrouped for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query, true);
    }

    getDeltaRtpVsNtCount(pcapID, streamID) {
        const query = `
            select count("delta_rtp_vs_NTs") as "count"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)}
        `;

        log.info(`Get DeltaToPreviousRtpTsRaw for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndCountResults(query);
    }


    getDeltaToPreviousRtpTsRaw(pcapID, streamID, startTime, endTime) {
        const wanted_resolution = Math.ceil((endTime - startTime) / 2000);
        const resolution = wanted_resolution <= 1 ? '1ns' : `${wanted_resolution}ns`;
        const query = `
            select "delta_previous_rtp_ts" as "value"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} and ${this.timeFilter(startTime, endTime)}
        `;

        log.info(`Get DeltaToPreviousRtpTsRaw for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query, false);
    }

    getDeltaToPreviousRtpTsMinMax(pcapID, streamID, startTime, endTime) {
        const query = `
            select max("delta_previous_rtp_ts") as "max", min("delta_previous_rtp_ts") as "min", mean("delta_previous_rtp_ts") as "avg"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} 
        `;

        log.info(`Get DeltaToPreviousRtpTsMinMax for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query, true);
    }

    getDeltaToPreviousRtpTsGrouped(pcapID, streamID, startTime, endTime, groupTime) {
        const query = `
            select max("delta_previous_rtp_ts") as "max", min("delta_previous_rtp_ts") as "min", mean("delta_previous_rtp_ts") as "avg"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} and ${this.timeGroupFilter(startTime, endTime, groupTime)}
        `;

        log.info(`Get DeltaToPreviousRtpTsGrouped for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query, true);
    }

    getDeltaToPreviousRtpTsCount(pcapID, streamID) {
        const query = `
            select count("delta_previous_rtp_ts") as "count"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)}
        `;

        log.info(`Get DeltaToPreviousRtpTsRaw for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndCountResults(query);
    }

    getPacketsPerFrame(pcapID, streamID, startTime, endTime) {
        const query = `
            select
            "packets_per_frame" as "value"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} and ${this.timeFilter(startTime, endTime)}
        `;

        log.info(`Get RTP pkt per frame for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query, false);
    }

    getAudioPktTsVsRtpTsRaw(pcapID, streamID, startTime, endTime) {
        const query = `
            select
            "audio-pkt-vs-rtp" as "value"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} and ${this.timeFilter(startTime, endTime)}
        `;

        log.info(`Get RTP-TS vs PKT-TS for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query, false);
    }

    getAudioPktTsVsRtpTsGrouped(pcapID, streamID, startTime, endTime, groupTime) {
        const grouped_fixed = (parseInt(groupTime) / 10000).toString();
        const query = `
            select
            max("audio-pkt-vs-rtp") as "max", min("audio-pkt-vs-rtp") as "min", mean("audio-pkt-vs-rtp") as "avg"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} and ${this.timeGroupFilter(startTime, endTime, groupTime)}
        `;

        log.info(`Get RTP-TS vs PKT-TS for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query, true);
    }

    getAudioPktTsVsRtpTsRange(pcapID, streamID) {
        const query = `
            select max("audio-pkt-vs-rtp") as "max", min("audio-pkt-vs-rtp") as "min", mean("audio-pkt-vs-rtp") as "avg"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)}
        `;

        log.info(`Get range of RTP-TS vs PKT-TS for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query, true);
    }

    getAudioPktTsVsRtpTsCount(pcapID, streamID) {
        const query = `
            select count("audio-pkt-vs-rtp") as "count"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)}
        `;

        log.info(`Get RTP-TS vs PKT-TS count for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndCountResults(query);
    }

    getAudioTimeStampedDelayFactor(pcapID, streamID, startTime, endTime) {
        const query = `
            select "audio-tsdf" as "value"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} and ${this.timeFilter(startTime, endTime)}
        `;

        log.info(`Get TSDF for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query, false);
    }

    getAudioTimeStampedDelayFactorRange(pcapID, streamID) {
        const query = `
            select max("audio-tsdf") as "max", min("audio-tsdf") as "min"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)}
        `;

        log.info(`Get range of TSDF for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query, true);
    }

    deleteSeries(pcapID) {
        const query = `drop series from /^${pcapID}$/`;

        log.info(`Delete measurements for ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query, true);
    }
}

module.exports = new InfluxDbManager();