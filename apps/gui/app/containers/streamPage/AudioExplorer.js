import React, { Fragment } from 'react';
import api from 'utils/api';
import SectionHeader from 'components/common/SectionHeader';
import AudioPlayer from 'components/audio/AudioPlayer';
import { translate } from 'utils/translation';

const AudioExplorer = (props) => {
    const { pcapID, streamID } = props;

    return (
        <Fragment>
            <SectionHeader label={translate('headings.audio_explorer')} icon="headset" />
            <AudioPlayer src={api.downloadMP3(pcapID, streamID)} />
        </Fragment>
    );
};

export default AudioExplorer;
