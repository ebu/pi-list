import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import WaveSurfer from 'wavesurfer.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.timeline.min.js';
import Button from '../common/Button';
import Loader from '../common/Loader';
import Slider from '../common/Slider';
import { translateC } from '../../utils/translation';

const createWaveSurfer = (waveform, timeline) => {
    const plugins = [];
    if (timeline) {
        plugins.push(TimelinePlugin.create({ container: '.wave-timeline' }));
    }

    const wavesurfer = WaveSurfer.create({
        autoCenter: true,
        backgroundColor: '#89B',
        barWidth: 1,
        container: waveform,
        cursorColor: '#800',
        cursorWidth: 3,
        height: 80,
        hideScrollbar: false,
        normalize: true,
        plugins,
        progressColor: '#2347fc',
        scrollParent: true,
        splitChannels: true,
        waveColor: '#5086d8',
        xhr: { withCredentials: true },
    });

    return wavesurfer;
};

const AudioPlayer = props => {
    const [isLoading, setIsLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasError, setHasError] = useState(false);
    const waveSurferRef = useRef(null);
    const waveformRef = useRef(null);

    const onPlayerReady = () => {
        setIsLoading(false);
        setHasError(false);
        waveSurferRef.current.seekTo(props.cursorInitPos);
        if (props.onCursorChanged) {
            waveSurferRef.current.on('seek', onSeek);
            waveSurferRef.current.on('pause', onSeek);
            onSeek();
        }
    };

    const onFinishPlay = () => {
        setIsPlaying(false);
    };

    const onPlayerError = () => {
        setHasError(true);
    };

    const onSeek = () => {
        const duration = waveSurferRef.current.getDuration();
        const currentTime = waveSurferRef.current.getCurrentTime();
        props.onCursorChanged(duration, currentTime);
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
    }, [props.src]);

    const play = () => {
        waveSurferRef.current.playPause();
        setIsPlaying(prevIsPlaying => !prevIsPlaying);
    };

    const onZoom = (v) => {
        waveSurferRef.current.zoom(v);
    };

    const buttonLabel = isPlaying ? translateC('audio_player.pause') : translateC('audio_player.play');
    const buttonType = isPlaying || hasError ? 'danger' : 'info';
    const buttonIcon = isPlaying ? 'pause' : 'play arrow';
    const buttonDisabled = hasError;

    return (
        <div ref={waveformRef} className="waveform center-xs middle-xs">
            {isLoading && <Loader />}
            <div className="wave" />
            <div className="wave-timeline" />
            {!isLoading && (
                <div className="row center">
                    <Button
                        type={buttonType}
                        label={buttonLabel}
                        icon={buttonIcon}
                        disabled={buttonDisabled}
                        outline
                        onClick={play}
                    />
                    <Slider
                        min={0}
                        max={10000}
                        type="zoom"
                        onChange={v => onZoom(parseInt(v))}
                    />
                </div>
            )}
        </div>
    );
};

AudioPlayer.propTypes = {
    src: PropTypes.object.isRequired,
    timeline: PropTypes.bool,
    onCursorChanged: PropTypes.func,
    cursorInitPos: PropTypes.number,
};

AudioPlayer.defaultProps = {
    timeline: false,
    onCursorChanged: null,
    cursorInitPos: 0,
};

export default AudioPlayer;
