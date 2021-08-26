import React from 'react';
import WaveSurfer, { WaveSurferPlugin } from 'wavesurfer.js';
import './styles.scss';
const TimelinePlugin = require('wavesurfer.js/dist/plugin/wavesurfer.timeline.min.js');
const CursorPlugin = require('wavesurfer.js/dist/plugin/wavesurfer.cursor.js');
import { Slider, ButtonAudioPlayer, CustomScrollbar } from 'components/index';
import { translate } from '../../../../utils/translation';

function timeInterval(pxPerSec: number) {
    let retval = 1;
    if (pxPerSec >= 25 * 100) {
        retval = 0.01;
    } else if (pxPerSec >= 25 * 40) {
        retval = 0.025;
    } else if (pxPerSec >= 25 * 10) {
        retval = 0.1;
    } else if (pxPerSec >= 25 * 4) {
        retval = 0.25;
    } else if (pxPerSec >= 25) {
        retval = 1;
    } else if (pxPerSec * 5 >= 25) {
        retval = 5;
    } else if (pxPerSec * 15 >= 25) {
        retval = 15;
    } else {
        retval = Math.ceil(0.5 / pxPerSec) * 60;
    }
    return retval;
}

const createWaveSurfer = (waveform: any) => {
    const wavesurfer = WaveSurfer.create({
        container: waveform,
        waveColor: '#80c1ff',
        progressColor: '#0083ff',
        splitChannels: true,
        autoCenter: true,
        scrollParent: true,
        fillParent: true,
        barWidth: 1,
        responsive: true,
        normalize: true,
        hideScrollbar: false,
        height: 120,
        cursorWidth: 3,
        cursorColor: 'rgba(255, 71, 71, 0.5)',

        xhr: { withCredentials: true },
        plugins: [
            TimelinePlugin.create({
                container: '.wave-timeline',
                timeInterval: timeInterval,
                primaryColor: '#39415a',
                secondaryColor: 'white',
                primaryFontColor: '#39415a',
                secondaryFontColor: 'white',
            }),
            CursorPlugin.create({
                showTime: true,
                opacity: 1,

                customShowTimeStyle: {
                    'background-color': '#fff',
                    color: '#000',
                    padding: '2px',
                    'font-size': '10px',
                },
                customStyle: {
                    'border-color': 'white',
                },
            }),
        ],
    });

    return wavesurfer;
};

function AudioPlayer({
    mp3Url,
    cursorInitPos,
    onCursorChanged,
}: {
    mp3Url: string;
    cursorInitPos: number,
    onCursorChanged: ((d: number, c: number) => void) | undefined;
}) {
    const [isLoading, setisLoading] = React.useState(true);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [hasError, setHasError] = React.useState(false);
    const waveSurferRef = React.useRef<any>(null);
    const waveformRef = React.useRef<HTMLDivElement>(null);

    const onPlayerReady = () => {
        setisLoading(false);
        setHasError(false);
        waveSurferRef.current.seekTo(cursorInitPos);

        if (onCursorChanged) {
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
        if (onCursorChanged) {
            const duration = waveSurferRef.current.getDuration();
            const currenttime = waveSurferRef.current.getCurrentTime();
            onCursorChanged(duration, currenttime);
        }
    };

    React.useEffect(() => {
        const waveform = waveformRef?.current?.querySelector('.wave');
        const wavesurfer = createWaveSurfer(waveform);
        waveSurferRef.current = wavesurfer;
        if (mp3Url === '') {
            return;
        }
        wavesurfer.load(mp3Url);

        wavesurfer.on('ready', onPlayerReady);
        wavesurfer.on('finish', onFinishPlay);
        wavesurfer.on('error', onPlayerError);

        return () => {
            wavesurfer.unAll();
            wavesurfer.destroy();
        };
    }, [mp3Url]);

    const play = () => {
        waveSurferRef?.current?.playPause();
        setIsPlaying(prevIsPlaying => !prevIsPlaying);
    };

    const onZoom = (value: number) => {
        waveSurferRef.current.zoom(value);
    };

    const onVolumeChange = (value: number) => {
        waveSurferRef.current.setVolume(value);
    };

    const buttonLabel = isPlaying ? translate('audio_player.pause') : translate('audio_player.play');
    const buttonType = isPlaying || hasError ? 'danger' : 'info';
    const buttonIcon = isPlaying ? 'pause' : 'play arrow';
    const buttonDisabled = hasError;

    return (
        <div ref={waveformRef} className="waveform">
            {/* {isLoading && <Loader />} */}

            <div className="wave"></div>

            <div className="wave-timeline"></div>
            {!isLoading && (
                <div className="waveform-controls">
                    <ButtonAudioPlayer
                        type={buttonType}
                        label={buttonLabel}
                        disabled={buttonDisabled}
                        outline
                        onClick={play}
                        icon={buttonIcon}
                    />

                    {/* <span style={{ color: 'white' }}>Volume</span> */}
                    <Slider
                        min={0}
                        max={1}
                        type="volume"
                        onChange={(e: any) => onVolumeChange(parseFloat(e))}
                        step={0.1}
                        initialValue={1}
                    />

                    {/* <span style={{ color: 'white' }}>Zoom</span> */}
                    <Slider
                        min={0}
                        max={10000}
                        type="zoom"
                        onChange={(e: any) => onZoom(parseInt(e))}
                        initialValue={0}
                    />
                </div>
            )}
        </div>
    );
}

export default AudioPlayer;
