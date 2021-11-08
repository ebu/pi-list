const Influx = require('influx');
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

    sendQueryAndFormatResults(query) {
        return this.influx.query(query).then((data) =>
            data.map((item) => ({
                ...item,
                time: item.time._nanoISO,
            }))
        );
    }

    getPtpOffsetSamplesByPcap(pcapID) {
        const query = `select "ptp_offset" as "value" from /^${pcapID}$/`;
        log.info(`Get PTP for the pcap ${pcapID}. Query: \n ${query}`);
        return this.sendQueryAndFormatResults(query);
    }

    getCInstRaw(pcapID, streamID, startTime, endTime) {
        const query = `
            select "cinst" as "value"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} and ${this.timeFilter(startTime, endTime)}
        `;

        log.info(`Get CInst for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query);
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

        return this.sendQueryAndFormatResults(query);
    }

    getVrxIdeal(pcapID, streamID, startTime, endTime, groupByNanoseconds) {
        const groupBy = groupByNanoseconds ? `group by time(${groupByNanoseconds}ns)` : 'group by time(2ms)';
        const query = `
            select max("gapped-ideal-vrx")
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} and ${this.timeFilter(startTime, endTime)}
            ${groupBy}
        `;

        log.info(`Get VRX Ideal for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query);
    }

    getVrxIdealRaw(pcapID, streamID, startTime, endTime) {
        const query = `
            select "gapped-ideal-vrx" as "value"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} and ${this.timeFilter(startTime, endTime)}
        `;

        log.info(`Get VRX Ideal in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query);
    }

    getDeltaToIdealTpr0Raw(pcapID, streamID, startTime, endTime) {
        const query = `
            select "gapped-ideal-delta_to_ideal_tpr0" as "value"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} and ${this.timeFilter(startTime, endTime)}
        `;

        log.info(`Get DeltaToIdealTpr0 for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query);
    }

    getDeltaRtpTsVsPacketTsRaw(pcapID, streamID, startTime, endTime) {
        const query = `
            select "delta_rtp_vs_packet_time" as "value"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} and ${this.timeFilter(startTime, endTime)}
        `;

        log.info(`Get DeltaRtpTsVsPacketTs for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query);
    }

    getDeltaPacketTimeVsRtpTimeRaw(pcapID, streamID, startTime, endTime) {
        const query = `
            select "delta_packet_time_vs_rtp_time_ns" as "value"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} and ${this.timeFilter(startTime, endTime)}
        `;

        log.info(
            `Get DeltaPacketTimeVsRtpTimeRaw for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`
        );

        return this.sendQueryAndFormatResults(query);
    }

    getDeltaPacketTimeVsRtpTimeMinMax(pcapID, streamID) {
        const query = `
            select max("delta_packet_time_vs_rtp_time_ns") as "max", min("delta_packet_time_vs_rtp_time_ns") as "min", mean("delta_packet_time_vs_rtp_time_ns") as "avg"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)}`;

        log.info(
            `Get DeltaPacketTimeVsRtpTimeMinMax for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`
        );

        return this.sendQueryAndFormatResults(query);
    }

    getDeltaRtpVsNt(pcapID, streamID, startTime, endTime) {
        const wanted_resolution = Math.ceil((endTime - startTime) / 2000);
        const resolution = wanted_resolution <= 1 ? '1ns' : `${wanted_resolution}ns`;
        const query = `
            select "delta_rtp_vs_NTs" as "value"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} and ${this.timeFilter(startTime, endTime)}
        `;

        log.info(`Get DeltaRtpTsVsPacketTs for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query);
    }

    getDeltaRtpVsNtTicksMinMax(pcapID, streamID) {
        const query = `
            select max("delta_rtp_vs_NTs") as "max", min("delta_rtp_vs_NTs") as "min", mean("delta_rtp_vs_NTs") as "avg"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)}`;

        log.info(`Get DeltaRtpVsNtTicksMinMax for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query);
    }

    getDeltaToPreviousRtpTsRaw(pcapID, streamID, startTime, endTime) {
        const wanted_resolution = Math.ceil((endTime - startTime) / 2000);
        const resolution = wanted_resolution <= 1 ? '1ns' : `${wanted_resolution}ns`;
        const query = `
            select "delta_previous_rtp_ts" as "value"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} and ${this.timeFilter(startTime, endTime)}
        `;

        log.info(`Get DeltaToPreviousRtpTsRaw for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query);
    }

    getDeltaToPreviousRtpTsMinMax(pcapID, streamID, startTime, endTime) {
        const query = `
            select max("delta_previous_rtp_ts") as "max", min("delta_previous_rtp_ts") as "min", mean("delta_previous_rtp_ts") as "avg"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)}
        `;

        log.info(`Get DeltaToPreviousRtpTsMinMax for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query);
    }

    getPacketsPerFrame(pcapID, streamID, startTime, endTime) {
        const query = `
            select
            "packets_per_frame" as "value"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} and ${this.timeFilter(startTime, endTime)}
        `;

        log.info(`Get RTP pkt per frame for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query);
    }

    getAudioPktTsVsRtpTsRaw(pcapID, streamID, startTime, endTime) {
        const query = `
            select
            "audio-pkt-vs-rtp" as "value"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} and ${this.timeFilter(startTime, endTime)}
        `;

        log.info(`Get RTP-TS vs PKT-TS for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query);
    }

    getAudioPktTsVsRtpTsGrouped(pcapID, streamID, startTime, endTime, groupTime) {
        const query = `
            select
            max("audio-pkt-vs-rtp") as "max", min("audio-pkt-vs-rtp") as "min", mean("audio-pkt-vs-rtp") as "avg"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} and ${this.timeGroupFilter(startTime, endTime, groupTime)}
        `;

        log.info(`Get RTP-TS vs PKT-TS for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query);
    }

    getAudioPktTsVsRtpTsRange(pcapID, streamID) {
        const query = `
            select max("audio-pkt-vs-rtp") as "max", min("audio-pkt-vs-rtp") as "min", mean("audio-pkt-vs-rtp") as "avg"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)}
        `;

        log.info(`Get range of RTP-TS vs PKT-TS for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query);
    }

    getAudioTimeStampedDelayFactor(pcapID, streamID, startTime, endTime) {
        const query = `
            select "audio-tsdf" as "value"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} and ${this.timeFilter(startTime, endTime)}
        `;

        log.info(`Get TSDF for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query);
    }

    getAudioTimeStampedDelayFactorRange(pcapID, streamID) {
        const query = `
            select max("audio-tsdf") as "max", min("audio-tsdf") as "min"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)}
        `;

        log.info(`Get range of TSDF for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query);
    }

    deleteSeries(pcapID) {
        const query = `drop series from /^${pcapID}$/`;

        log.info(`Delete measurements for ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query);
    }
}

module.exports = new InfluxDbManager();
