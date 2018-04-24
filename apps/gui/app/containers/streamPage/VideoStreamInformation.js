import React, { Component } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import api from 'utils/api';
import chartFormatters from 'utils/chartFormatters';
import NetworkInfo from 'containers/streamPage/NetworkInfo';
import VideoInfo from 'containers/streamPage/VideoInfo';
import VideoStatistics from 'containers/streamPage/VideoStatistics';
import SectionHeader from 'components/common/SectionHeader';
import Chart from 'components/Chart';

class VideoStreamInformation extends Component {

    render() {
        const streamInfo = this.props.streamInfo;
        const networkInfo = streamInfo.network_information;
        const statistics = streamInfo.statistics;
        const mediaInfo = streamInfo.media_specific;

        const { first_packet_ts, last_packet_ts } = streamInfo.statistics;
        const { streamID, pcapID } = this.props;

        return (
            <div className="row">
                <div className="col-xs-12 col-md-4">
                    <NetworkInfo {...networkInfo} packet_count={statistics.packet_count} />
                </div>
                <div className="col-xs-12 col-md-4">
                    <VideoInfo {...mediaInfo} />
                </div>
                <div className="col-xs-12 col-md-4">
                    <VideoStatistics {...statistics} />
                </div>
            </div>
        );
    }
}

export default VideoStreamInformation;
