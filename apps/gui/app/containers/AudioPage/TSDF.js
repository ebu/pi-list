import React from 'react';
import Panel from '../../components/common/Panel';
import api from '../../utils/api';
import Graphs from '../../components/graphs';

const TSDF = props => {
    const analysis = props.streamInfo.global_audio_analysis;
    const { first_packet_ts, last_packet_ts } = props.streamInfo.statistics;

    return (
        <Panel className="lst-stream-info-tab">
            <div className="row lst-full-height">
                <div className="col-xs-12">
                    <Graphs.Line
                        titleTag="media_information.tsdf"
                        xTitleTag="media_information.timeline"
                        yTitle="Value (μs)"
                        asyncGetter={() =>
                            api.getAudioTimeStampedDelayFactor(
                                props.pcapID,
                                props.streamID,
                                first_packet_ts,
                                last_packet_ts,
                                analysis.tsdf.tolerance,
                                analysis.tsdf.max
                            )
                        }
                    />
                </div>
            </div>
        </Panel>
    );
};

export default TSDF;
