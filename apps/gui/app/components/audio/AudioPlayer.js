import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import WaveSurfer from 'wavesurfer.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.timeline.min.js';
import Button from '../common/Button';
import Loader from '../common/Loader';
import { translateC } from '../../utils/translation';

const createWaveSurfer = (waveform, timeline) => {
    const plugins = [];
    if (timeline) {
        plugins.push(TimelinePlugin.create({ container: '.wave-timeline' }));
    }

    const wavesurfer = WaveSurfer.create({
        container: waveform,
        waveColor: '#5086d8',
        progressColor: '#2347fc',
        splitChannels: true,
        autoCenter: true,
        barWidth: 1,
        normalize: true,
        hideScrollbar: false,
        height: 80,
        cursorWidth: 2,
        plugins,
        xhr: { withCredentials: true }
    });

    return wavesurfer;
};

const AudioPlayer = (props) => {
    const [isLoading, setisLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasError, setHasError] = useState(false);
    const waveSurferRef = useRef(null);
    const waveformRef = useRef(null);

    const onPlayerReady = () => {
        setisLoading(false);
        setHasError(false)
    };

    const onFinishPlay = () => {
        setIsPlaying(false);
    };

    const onPlayerError = () => {
        setHasError(true)
    };

    useEffect(() => {
        const waveform = waveformRef.current.querySelector('.wave');
        const wavesurfer = createWaveSurfer(waveform, props.timeline);
        waveSurferRef.current = wavesurfer;

        wavesurfer.load(props.src);
        wavesurfer.on('ready', onPlayerReady);
        wavesurfer.on('finish', onFinishPlay);
        wavesurfer.on('error', onPlayerError);

        return () => {
            wavesurfer.unAll();
            wavesurfer.destroy();
        };
    },
        [props.src]
    );

    const play = () => {
        waveSurferRef.current.playPause();
        setIsPlaying((prevIsPlaying) => !prevIsPlaying);
    };

    const buttonLabel = isPlaying ? translateC('audio_player.pause') : translateC('audio_player.play');
    const buttonType = (isPlaying || hasError) ? 'danger' : 'info';
    const buttonIcon = isPlaying ? 'pause' : 'play arrow';
    const buttonDisabled = hasError;

    return (
        <div ref={waveformRef} className="waveform center-xs middle-xs" >
            {isLoading && <Loader />}
            <div className="wave" />
            <div className="wave-timeline" />
            {!isLoading &&
                <Button type={buttonType} label={buttonLabel} icon={buttonIcon} disabled={buttonDisabled} outline onClick={play} />
            }
        </div >
    );
};

AudioPlayer.propTypes = {
    src: PropTypes.string.isRequired,
    timeline: PropTypes.bool,
};

AudioPlayer.defaultProps = {
    timeline: false
};

export default AudioPlayer;
