const Influx = require('influx');
const logger = require('../util/logger');
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
            database: 'LIST'
        });

        log.info(`Influx DB Manager connect to ${program.influxURL}`);
    }

    fromPcapIdWhereStreamIs(pcapID, streamID) {
        return `from /^${pcapID}$/ where ("stream" =~ /^"${streamID}"$/)`
    }

    timeFilter(startTime, endTime) {
        return `time >= ${startTime}ns and time <= ${endTime}ns`
    }

    sendQueryAndFormatResults(query) {
        return this.influx.query(query)
            .then(data => data.map(item => ({
                ...item,
                time: item.time._nanoISO
            })));
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
        const resolution = wanted_resolution <= 1 ? "1ns" : `${wanted_resolution}ns`;
        const query = `
            select max("cinst"), min("cinst"), mean("cinst"), stddev("cinst")
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} and ${this.timeFilter(startTime, endTime)}
            group by time(${resolution})
        `;

        log.info(`Get CInst for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query);
    }

    getVrxIdeal(pcapID, streamID, startTime, endTime) {
        const query = `
            select max("gapped-ideal-vrx"), min("gapped-ideal-vrx")
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} and ${this.timeFilter(startTime, endTime)}
            group by time(2ms)
        `;

        log.info(`Get VRX Ideal for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query);
    }

    getVrxFirstPacketFirstFrame(pcapID, streamID, startTime, endTime) {
        const query = `
            select max("gapped-first_packet_first_frame-vrx"), min("gapped-first_packet_first_frame-vrx")
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} and ${this.timeFilter(startTime, endTime)}
            group by time(2ms)
        `;

        log.info(`Get VRX First Packet First Frame for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query);
    }

    getVrxFirstPacketEachFrame(pcapID, streamID, startTime, endTime) {
        const wanted_resolution = Math.ceil((endTime - startTime) / 2000);
        const resolution = wanted_resolution <= 1 ? "1ns" : `${wanted_resolution}ns`;
        const query = `
            select max("gapped-first_packet_each_frame-vrx"), min("gapped-first_packet_each_frame-vrx")
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} and ${this.timeFilter(startTime, endTime)}
            group by time(${resolution})
        `;

        log.info(`Get VRX First Packet Each Frame for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query);
    }

    getVrxFirstPacketEachFrameRaw(pcapID, streamID, startTime, endTime) {
        const query = `
            select "gapped-first_packet_each_frame-vrx" as "value"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} and ${this.timeFilter(startTime, endTime)}
        `;

        log.info(`Get VRX First Packet Each Frame for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query);
    }

    getDeltaToIdealTpr0Raw(pcapID, streamID, startTime, endTime) {
        const wanted_resolution = Math.ceil((endTime - startTime) / 2000);
        const resolution = wanted_resolution <= 1 ? "1ns" : `${wanted_resolution}ns`;
        const query = `
            select "gapped-ideal-delta_to_ideal_tpr0" as "value"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} and ${this.timeFilter(startTime, endTime)}
        `;

        log.info(`Get DeltaToIdealTpr0 for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query);
    }

    getDeltaRtpTsVsPacketTsRaw(pcapID, streamID, startTime, endTime) {
        const wanted_resolution = Math.ceil((endTime - startTime) / 2000);
        const resolution = wanted_resolution <= 1 ? "1ns" : `${wanted_resolution}ns`;
        const query = `
            select "delta_rtp_vs_packet_time" as "value"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} and ${this.timeFilter(startTime, endTime)}
        `;

        log.info(`Get DeltaRtpTsVsPacketTs for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query);
    }

    getDeltaRtpVsNt(pcapID, streamID, startTime, endTime) {
        const wanted_resolution = Math.ceil((endTime - startTime) / 2000);
        const resolution = wanted_resolution <= 1 ? "1ns" : `${wanted_resolution}ns`;
        const query = `
            select "delta_rtp_vs_NTs" as "value"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} and ${this.timeFilter(startTime, endTime)}
        `;

        log.info(`Get DeltaRtpTsVsPacketTs for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query);
    }
    
    getDeltaToPreviousRtpTsRaw(pcapID, streamID, startTime, endTime) {
        const wanted_resolution = Math.ceil((endTime - startTime) / 2000);
        const resolution = wanted_resolution <= 1 ? "1ns" : `${wanted_resolution}ns`;
        const query = `
            select "delta_previous_rtp_ts" as "value"
            ${this.fromPcapIdWhereStreamIs(pcapID, streamID)} and ${this.timeFilter(startTime, endTime)}
        `;

        log.info(`Get DeltaRtpTsVsPacketTs for the stream ${streamID} in the pcap ${pcapID}. Query: \n ${query}`);

        return this.sendQueryAndFormatResults(query);
    }
}


module.exports = new InfluxDbManager();
