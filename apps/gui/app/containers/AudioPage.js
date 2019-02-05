import React from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import Panel from 'components/common/Panel';
import NetworkInfo from 'containers/streamPage/NetworkInfo';
import AudioInfo from 'containers/streamPage/AudioInfo';
import AudioStatistics from 'containers/streamPage/AudioStatistics';
import AudioExplorer from 'containers/streamPage/AudioExplorer';
import LineChart from 'components/LineChart';
import api from 'utils/api';
import chartFormatters from 'utils/chartFormatters';
import Button from 'components/common/Button';

const AudioPage = (props) => {
    const streamInfo = props.streamInfo;
    const networkInfo = streamInfo.network_information;
    const statistics = streamInfo.statistics;
    const analysis = streamInfo.global_audio_analysis;
    const mediaInfo = streamInfo.media_specific;
    const { first_packet_ts, last_packet_ts } = props.streamInfo.statistics;

    return (
        <Scrollbars>
            <Panel className="lst-stream-info-tab">
                <div className="row lst-full-height">
                    <div className="col-xs-12 col-md-4">
                        <NetworkInfo {...networkInfo} packet_count={statistics.packet_count} />
                        <AudioInfo {...mediaInfo} />
                        <AudioStatistics {...statistics} tsdf_max={analysis.tsdf_max} />
                    </div>
                    <div className="col-xs-12 col-md-8">
                        <AudioExplorer pcapID={props.pcapID} streamID={props.streamID}/>
                        <LineChart
                            asyncData={() => api.getAudioTransitDelay(props.pcapID, props.streamID, first_packet_ts, last_packet_ts)}
                            xAxis={chartFormatters.getTimeLineLabel}
                            data={chartFormatters.stdDeviationMeanMinMaxLineChart}
                            title="Transit Time"
                            yAxisLabel="Delay (usec)"
                            height={300}
                            lineWidth={3}
                            legend
                        />
                        <LineChart
                            // provide packet_time and tsdf to plot the yellow tolerance and red limit lines respectively
                            asyncData={() => api.getAudioTimeStampedDelayFactor(props.pcapID, props.streamID, first_packet_ts, last_packet_ts, mediaInfo.packet_time * 1000, analysis.tsdf_max)}
                            xAxis={chartFormatters.getTimeLineLabel}
                            data={chartFormatters.singleValueLineThresholdChart}
                            title="TimeStamped Delay Factor"
                            yAxisLabel="TSDF (usec)"
                            height={300}
                            lineWidth={3}
                            legend
                        />
                    </div>
                    <Button type="info" label="See EBU's TR for TSDF" onClick={() => {window.open('https://tech.ebu.ch/docs/tech/tech3337.pdf', '_blank')}}/>
                </div>
            </Panel>
        </Scrollbars>
    );
};

export default AudioPage;
