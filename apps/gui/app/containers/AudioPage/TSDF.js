import React from 'react';
import Panel from '../../components/common/Panel';
import LineChart from '../../components/LineChart';
import api from '../../utils/api';
import chartFormatters from '../../utils/chartFormatters';
import { translateX } from '../../utils/translation';

const TSDF = props => {
    const analysis = props.streamInfo.global_audio_analysis;
    const { first_packet_ts, last_packet_ts } = props.streamInfo.statistics;

    return (
        <Panel className="lst-stream-info-tab">
            <div className="row lst-full-height">
                <div className="col-xs-12">
                    <LineChart
                        // provide packet_time and tsdf to plot the yellow tolerance and red limit lines respectively
                        asyncData={() =>
                            api.getAudioTimeStampedDelayFactor(
                                props.pcapID,
                                props.streamID,
                                first_packet_ts,
                                last_packet_ts,
                                analysis.tsdf.tolerance,
                                analysis.tsdf.max
                            )
                        }
                        xAxis={chartFormatters.getTimeLineLabel}
                        data={[].concat(
                            chartFormatters.highThersholdsLineChart,
                            chartFormatters.singleValueLineChart
                        )}
                        titleTag='media_information.tsdf'
                        yAxisLabel={translateX('media_information.tsdf_axis_label')}
                        height={300}
                        lineWidth={3}
                        legend
                    />
                </div>
            </div>
        </Panel>
    );
};

export default TSDF;
