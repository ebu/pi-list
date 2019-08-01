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

const AudioPage = props => {
    const streamInfo = props.streamInfo;
    const statistics = streamInfo.statistics;
    const analysis = streamInfo.global_audio_analysis;
    const mediaInfo = streamInfo.media_specific;
    const { first_packet_ts, last_packet_ts } = props.streamInfo.statistics;

    return (
        <Scrollbars>
            <Panel className='lst-stream-info-tab'>
                <div className='row lst-full-height'>
                    <div className='col-xs-12 col-md-4'>
                        <NetworkInfo stream={ props.streamInfo } />
                        <AudioInfo { ...mediaInfo } />
                        <AudioStatistics
                            { ...statistics }
                            analysis={ analysis }
                        />
                    </div>

                    <div className='col-xs-12 col-md-8'>
                        <AudioExplorer
                            pcapID={ props.pcapID }
                            streamID={ props.streamID }
                            channelNum={ mediaInfo.number_channels }
                        />
                        <LineChart
                            asyncData={ () =>
                                api.getAudioRtpTsVsPktTs(
                                    props.pcapID,
                                    props.streamID,
                                    first_packet_ts,
                                    last_packet_ts,
                                    analysis.rtp_ts_vs_pkt_ts.range.min,
                                    analysis.rtp_ts_vs_pkt_ts.range.max,
                                )
                            }
                            xAxis={ chartFormatters.getTimeLineLabel }
                            data={ chartFormatters.statsLineChart }
                            title='Delta from RTP TS to packet TS'
                            yAxisLabel='Delay (μs)'
                            height={ 300 }
                            lineWidth={ 3 }
                            legend
                        />
                        <LineChart
                            // provide packet_time and tsdf to plot the yellow tolerance and red limit lines respectively
                            asyncData={ () =>
                                api.getAudioTimeStampedDelayFactor(
                                    props.pcapID,
                                    props.streamID,
                                    first_packet_ts,
                                    last_packet_ts,
                                    analysis.tsdf.tolerance,
                                    analysis.tsdf.max,
                                )
                            }
                            xAxis={ chartFormatters.getTimeLineLabel }
                            data={ [].concat(
                                chartFormatters.highThersholdsLineChart,
                                chartFormatters.singleValueLineChart,
                            ) }
                            title='Time Stamped Delay Factor'
                            yAxisLabel='TSDF (μs)'
                            height={ 300 }
                            lineWidth={ 3 }
                            legend
                        />
                    </div>
                    <Button
                        type='info'
                        label='Audio analysis explained'
                        onClick={() => {
                            window.open(
                                'https://github.com/ebu/pi-list/blob/master/docs/audio_timing_analysis.md',
                                '_blank'
                            );
                        }}
                    />
                </div>
            </Panel>
        </Scrollbars>
    );
};

export default AudioPage;
