import React from 'react';
import Panel from '../../components/common/Panel';
import api from '../../utils/api';
import Graphs from '../../components/graphs';

const RTP = props => {
    const { first_packet_ts, last_packet_ts } = props.streamInfo.statistics;

    return (
        <Panel className="lst-stream-info-tab">
            <div className="row lst-full-height">
                <div className="col-xs-12">
                    <Graphs.Line
                        titleTag="media_information.rtp.delta_packet_time_vs_rtp_time"
                        xTitleTag="media_information.timeline"
                        yTitleTag="media_information.delay"
                        asyncGetter={() =>
                            api.getAudioPktTsVsRtpTs(
                                props.pcapID,
                                props.streamID,
                                first_packet_ts,
                                last_packet_ts)
                        }
                    />
                </div>
            </div>
        </Panel>
    );
};

export default RTP;
