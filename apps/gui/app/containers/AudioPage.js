import React from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import Panel from 'components/common/Panel';
import NetworkInfo from 'containers/streamPage/NetworkInfo';
import AudioInfo from 'containers/streamPage/AudioInfo';
import AudioStatistics from 'containers/streamPage/AudioStatistics';
import AudioExplorer from 'containers/streamPage/AudioExplorer';

const AudioPage = (props) => {
    const streamInfo = props.streamInfo;
    const networkInfo = streamInfo.network_information;
    const statistics = streamInfo.statistics;
    const mediaInfo = streamInfo.media_specific;

    return (
        <Scrollbars>
            <Panel className="lst-stream-info-tab">
                <div className="row lst-full-height">
                    <div className="col-xs-12 col-md-4">
                        <NetworkInfo {...networkInfo} packet_count={statistics.packet_count} />
                        <AudioInfo {...mediaInfo} />
                        <AudioStatistics {...statistics} />
                    </div>
                    <div className="col-xs-12 col-md-8">
                        <AudioExplorer pcapID={props.pcapID} streamID={props.streamID}/>
                    </div>
                </div>
            </Panel>
        </Scrollbars>
    );
};

export default AudioPage;
