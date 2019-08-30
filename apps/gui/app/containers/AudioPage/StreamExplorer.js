import React from 'react';
import Panel from '../../components/common/Panel';
import AudioExplorer from '../streamPage/AudioExplorer';

const StreamExplorer = props => {
    const mediaInfo = props.streamInfo.media_specific;
    return (
        <Panel className="lst-stream-info-tab">
            <div className="row lst-full-height">
                <div className="col-xs-12">
                    <AudioExplorer
                        pcapID={props.pcapID}
                        streamID={props.streamID}
                        channelNum={mediaInfo.number_channels}
                    />
                </div>
            </div>
        </Panel>
    );
};

export default StreamExplorer;
