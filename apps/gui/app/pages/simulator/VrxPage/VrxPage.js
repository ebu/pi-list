import React, { useState, useRef } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Plot from 'react-plotly.js';
import * as types from './types';
import { get_read_schedule, get_n_packets } from './common';
import { generateFlow, generateReads, addJitter, generateActiveAreas } from './generator';
import { analyze as event_analysis } from './event_analysis';
import { analyze as instantaneous_analysis } from './instantaneous_analysis';
import { iota, take } from './utils';
import './VrxPage.scss';

const defaultPgroupsPerPacket = 264;
const defaultFirstN = 0;

const PacketsTable = props => {
    return (
        <div className="container">
            <div className="table-responsive">
                <table className="table table-responsive">
                    <thead>
                        <tr>
                            <th>Packet TS</th>
                            <th>RTP TS</th>
                            <th>RTP SN</th>
                            <th>Marker</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.packets.map((packet, index) => (
                            <tr key={index}>
                                <td>{packet.ts.toFixed(9)}</td>
                                <td>{packet.rtpTS}</td>
                                <td>{packet.sequenceNumber}</td>
                                <td>{packet.marker ? 'X' : ''}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

PacketsTable.propTypes = {
    packets: PropTypes.arrayOf(types.PacketShape).isRequired,
};

const EventAnalysisTable = props => {
    return (
        <table>
            <thead>
                <tr>
                    <th>Kind</th>
                    <th>TS</th>
                    <th>RTP SN</th>
                </tr>
            </thead>
            <tbody>
                {props.events.map((event, index) => {
                    const isRead = event.kind === types.events.read;
                    const sn = isRead ? event.expectedSequenceNumber : event.packet.sequenceNumber;
                    return (
                        <tr key={index}>
                            <td>{event.kind}</td>
                            <td>{event.ts.toFixed(9)}</td>
                            <td>{sn}</td>
                            <td>{event.vrx}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};

EventAnalysisTable.propTypes = {
    events: PropTypes.arrayOf(types.EventShape).isRequired,
};

export function* takeFrame(iter) {
    let frame = [];

    for (const packet of iter) {
        frame.push(packet);
        if (packet.marker) {
            const result = frame;
            frame = [];
            yield result;
        }
    }
}

/*
return: { writeTs: <write TS>, delta: <positive means write is earlier>}
*/
function* packetTsDifference(reads, writes) {
    const iterator = writes[Symbol.iterator]();

    for (const read of reads) {
        const write = iterator.next();
        if (write.done) {
            return;
        }

        const delta = read.ts - write.value.ts;
        yield { writeTs: write.value.ts, delta: delta };
    }
}

const numberOr0 = value => {
    const v = parseFloat(value, 10);
    return isNaN(v) ? 0 : v;
};

const useNumberControl = (label, defaultValue, units) => {
    const ref = useRef();

    const [value, setValue] = useState(defaultValue);
    ref.current = value;

    const onChange = e => {
        setValue(e.target.value);
    };

    const control = (
        <div>
            <span>{label}</span>
            <input type="number" value={value} onChange={onChange} />
            {units && <span>{units}</span>}
        </div>
    );

    return [ref, control];
};

const toMicroseconds = v => (v * 1000000).toFixed(3);

function* merge(it) {
    for (const a of it) {
        yield* a;
    }
}

const Graph = ({ activeAreas, x, y, title }) => {
    const min = _.min(y);
    const max = _.max(y);

    const activeAreasX = activeAreas.map(v => v.x);
    const activeAreasY = activeAreas.map(v => (v.y === 0 ? 0 : max));

    const activeAreas2X = activeAreas.map(v => v.x);
    const activeAreas2Y = activeAreas.map(v => (v.y === 0 ? 0 : min));

    return (
        <Plot
            className="app-plot"
            data={[
                {
                    x: x,
                    y: y,
                    type: 'scatter',
                    mode: 'markers',
                    marker: { color: 'red' },
                },
                {
                    x: activeAreasX,
                    y: activeAreasY,
                    fill: 'tozeroy',
                    type: 'scatter',
                    mode: 'none',
                    marker: { color: 'yellow' },
                },
                {
                    x: activeAreas2X,
                    y: activeAreas2Y,
                    fill: 'tozeroy',
                    type: 'scatter',
                    mode: 'none',
                    marker: { color: 'yellow' },
                },
            ]}
            layout={{
                autosize: false,
                width: 1000,
                margin: {
                    l: 50,
                    r: 50,
                    b: 100,
                    t: 100,
                    pad: 4,
                },
                // paper_bgcolor: '#7f7f7f',
                // plot_bgcolor: '#7f7f7f',
                title: title,
            }}
            useResizeHandler
            config={{ scrollZoom: false, responsive: true }}
            style={{ width: '100%', height: '100%' }}
        />
    );
};

const VrxPage = () => {
    const [jitterSigmaRef, jitterSigmaControl] = useNumberControl('Jitter sigma:', 0, 'x Trs');
    const [senderTvdFactorRef, senderTvdFactorControl] = useNumberControl('Tvd offset:', 0, 'x Trs');
    const [senderSpacingFactorRef, senderSpacingFactorControl] = useNumberControl(
        'Packet spacing increment:',
        0,
        'x Trs'
    );

    const [receiverTROffsetFactorRef, receiverTROffsetFactorControl] = useNumberControl('TPROffset factor:', 0, 'x Trs');

    const numberOfFrames = 3;
    const flowSettings = {
        Tframe: 1 / 50,
        width: 1280,
        height: 720,
        pgroupsPerPacket: defaultPgroupsPerPacket,
        interlaced: false,
    };

    const frameSettings = {
        N0: 0,
    };

    const senderSettings = {
        tvdFactor: numberOr0(senderTvdFactorRef.current),
        packetSpacingFactor: numberOr0(senderSpacingFactorRef.current),
    };

    const receiverSettings = {
        trOffsetFactor: receiverTROffsetFactorRef.current
    };

    const networkSettings = {
    };

    const readSchedule = get_read_schedule(flowSettings);
    const packetsPerFrame = get_n_packets(flowSettings);
    const numberOfPackets = numberOfFrames * packetsPerFrame;

    const packetGenerator = generateFlow(flowSettings, frameSettings, senderSettings);
    const packetsWithJitter = addJitter(readSchedule.trs, numberOr0(jitterSigmaRef.current), packetGenerator);
    const packets = [...take(numberOfPackets, packetsWithJitter)];
    const reads = [...take(numberOfPackets, generateReads(flowSettings, frameSettings, receiverSettings))];

    const differences = [...packetTsDifference(reads, packets)];

    const eventAnalysis = [...event_analysis(packets, reads)];

    const instantaneousAnalysis = [...instantaneous_analysis(flowSettings, packets, reads)];
    
    const activeAreas = [...merge(take(numberOfFrames, generateActiveAreas(flowSettings, frameSettings.N0)))];
    const packetDifferencesX = differences.map(d => d.writeTs);
    const packetDifferencesY = differences.map(d => d.delta);

    return (
        <div className="app-simulator-vrx">
            <div className="app-params">
                <h1>Read schedule</h1>
                <div>
                    <p>Tro: {toMicroseconds(readSchedule.tro)} μs</p>
                    <p>Trs: {toMicroseconds(readSchedule.trs)} μs</p>
                </div>
                <h1>Sender</h1>
                {jitterSigmaControl}
                {senderTvdFactorControl}
                {senderSpacingFactorControl}
                {receiverTROffsetFactorControl}
            </div>
            <div className="app-graphs">
                <Graph
                    activeAreas={activeAreas}
                    title="Write vs read delta"
                    x={packetDifferencesX}
                    y={packetDifferencesY}
                />
                <Graph
                    title="VRX (event)"
                    activeAreas={activeAreas}
                    x={eventAnalysis.map(d => d.ts)}
                    y={eventAnalysis.map(d => d.vrx)}
                />
                <Graph
                    title="VRX (instantaneous)"
                    activeAreas={activeAreas}
                    x={instantaneousAnalysis.map(d => d.ts)}
                    y={instantaneousAnalysis.map(d => d.vrx)}
                />
            </div>
        </div>
    );
};

export default VrxPage;
