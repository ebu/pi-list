import React from 'react';
import { useLocation } from 'react-router-dom';
import _ from 'lodash';
import './DroppedPacketsPage.scss';

const PacketGap = ({ lastSN, firstSN, packetTS }) => (
    <tr>
        <td>{lastSN}</td>
        <td>{firstSN}</td>
        <td>{packetTS}</td>
    </tr>
);

const DroppedPacketsPage = props => {
    const location = useLocation();

    const droppedPackets = _.get(location, 'state.droppedPackets');

    return (
        <div className="row center-xs">
            <div className="col-xs-6">
                <div className="box app-dropped-packets">
                    <h1>Dropped packets</h1>
                    <div className="row center-xs">
                        <table>
                            <thead>
                                <th>Last packet SN before drop</th>
                                <th>First packet SN after drop</th>
                                <th>First packet TS after drop</th>
                            </thead>
                            <tbody>
                                {droppedPackets.map((p, index) => (
                                    <PacketGap
                                        key={index}
                                        packetTS={p.first_packet_timestamp}
                                        firstSN={p.first_sequence_number}
                                        lastSN={p.last_sequence_number}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DroppedPacketsPage;
