import { max } from 'moment';
import { get_n_packets, get_read_schedule, modulusTS, modulusSN } from './common';
import { gaussian } from './utils';

const clamp = (v, min, max) => (v < min ? min : Math.min(v, max));

function* generatePacketsFlow(N0, frame_index, Tframe, n_packets, tvd, packetGap) {
    const NxT = (N0 + frame_index) * Tframe;
    const rtpTS = modulusTS(Math.floor(NxT * 90000));
    for (let packet_n = 0; packet_n < n_packets; ++packet_n) {
        const delta = 0; //packet_n % n_packets === 5 ? 3 * packetGap : 0;
        const packet = {
            ts: NxT + tvd + packet_n * packetGap - delta,
            rtpTS: rtpTS,
            sequenceNumber: modulusSN(frame_index * n_packets + packet_n),
            marker: packet_n === n_packets - 1,
        };
        yield packet;
    }
}

export function* generateFlow(flowSettings, frameSettings, senderSettings) {
    const n_packets = get_n_packets(flowSettings);
    const readSchedule = get_read_schedule(flowSettings);

    const packetGap = senderSettings.packetSpacingFactor
        ? readSchedule.trs + senderSettings.packetSpacingFactor * readSchedule.trs
        : readSchedule.trs;
    const tvd = senderSettings.tvdFactor
        ? readSchedule.tro + senderSettings.tvdFactor * readSchedule.trs
        : readSchedule.tro;

    for (let frame_index = 0; ; ++frame_index) {
        yield* generatePacketsFlow(frameSettings.N0, frame_index, flowSettings.Tframe, n_packets, tvd, packetGap);
    }
}

function* generateFrameReads(N0, frame_index, Tframe, n_packets, tro, trs) {
    const NxT = (N0 + frame_index) * Tframe;
    for (let packet_n = 0; packet_n < n_packets; ++packet_n) {
        yield { ts: NxT + tro + packet_n * trs };
    }
}

export function* generateReads(flowSettings, frameSettings, receiverSettings) {
    const n_packets = get_n_packets(flowSettings);
    const readSchedule = get_read_schedule(flowSettings);

    const tro = receiverSettings.trOffsetFactor
        ? readSchedule.tro + receiverSettings.trOffsetFactor * readSchedule.trs
        : readSchedule.tro;

    for (let frame_index = 0; ; ++frame_index) {
        yield* generateFrameReads(
            frameSettings.N0,
            frame_index,
            flowSettings.Tframe,
            n_packets,
            tro,
            readSchedule.trs
        );
    }
}

const ONE_NS = 0.000000001;

/*
Adds jitter to each packet
*/
export function* addJitter(max, jitterSigma, packets) {
    const offset_getter = gaussian(0, jitterSigma);
    const get_offset = () => (jitterSigma ? offset_getter() * max : 0);
    let lastTs = 0;
    for (const packet of packets) {
        const offset = get_offset();
        const ts = Math.max(packet.ts + offset, lastTs + ONE_NS);
        lastTs = ts;
        yield { ...packet, ts: ts };
    }
}

/* returns {
    x: [0, (start of frame, end of frame)...]
    y: [0, 1, 1, ...]
}
*/
export function* generateActiveAreas(flowSettings, n0) {
    const readSchedule = get_read_schedule(flowSettings);
    const n_packets = get_n_packets(flowSettings);

    for (let n = n0; ; ++n) {
        const base = n * flowSettings.Tframe;
        const start = base + readSchedule.tro;
        const end = start + readSchedule.trs * n_packets;
        yield [
            { x: base, y: 0 },
            { x: start, y: 0 },
            { x: start, y: 1 },
            { x: end, y: 1 },
            { x: end, y: 0 },
        ];
    }
}
