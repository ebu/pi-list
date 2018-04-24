import React, { Fragment } from 'react';
import api from 'utils/api';
import SectionHeader from 'components/common/SectionHeader';
import AudioPlayer from 'components/audio/AudioPlayer';

const AudioExplorer = (props) => {
    const { pcapID, streamID } = props;

    return (
        <Fragment>
            <SectionHeader label="Audio Explorer" icon="headset" />
            <AudioPlayer src={api.downloadMP3(pcapID, streamID)} />
        </Fragment>
    );
}

export default AudioExplorer;
