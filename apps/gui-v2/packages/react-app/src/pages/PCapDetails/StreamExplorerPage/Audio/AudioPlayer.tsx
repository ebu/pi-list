import React from 'react';
import { useWavesurfer } from '@wavesurfer/react'
import Timeline from 'wavesurfer.js/dist/plugins/timeline.esm.js'

import './styles.scss';

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

function AudioPlayer({ mp3Url }: { mp3Url: string }) {
    const [isLoading, setisLoading] = React.useState(true);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [hasError, setHasError] = React.useState(false);
    const waveContainerRef = React.useRef<HTMLDivElement>(null);

    const timelinePlugin = React.useMemo(() => (
        Timeline.create({ container: '.wave-timeline' })
    ), []);

    const wsOptions = React.useMemo(() => ({
        container: waveContainerRef,
        progressColor: '#0083ff',
        autoCenter: true,
        fillParent: true,
        barWidth: 1,
        normalize: true,
        hideScrollbar: false,
        height: 120,
        cursorWidth: 3,
        cursorColor: 'rgba(255, 71, 71, 0.5)',
        plugins: [timelinePlugin],
    }), [timelinePlugin]);

    const { wavesurfer, isReady } = useWavesurfer(wsOptions);

    const onFinishPlay = () => setIsPlaying(false);

    // Load audio and attach handlers when url changes
    React.useEffect(() => {
        if (!wavesurfer || !mp3Url) return;

        setisLoading(true);
        setHasError(false);

        const handleReady = () => {
            setisLoading(false);
        };
        const handleError = () => {
            setHasError(true);
            setisLoading(false);
        };
        const handleFinish = onFinishPlay;

        wavesurfer.on('ready', handleReady);
        wavesurfer.on('error', handleError);
        wavesurfer.on('finish', handleFinish);

        // Check content-type before loading to avoid WaveSurfer crashes
        // when the first requests don't have the correct content-type
        const loadWithContentTypeCheck = async () => {
            try {
                const response = await fetch(mp3Url, { method: 'HEAD' });
                const contentType = response.headers.get('content-type') || '';
                
                if (contentType.startsWith('audio/') || contentType.includes('mpeg')) {
                    wavesurfer.load(mp3Url);
                } else {
                    // Not ready yet, trigger retry logic
                    handleError();
                }
            } catch (error) {
                handleError();
            }
        };

        loadWithContentTypeCheck();

        return () => {
            wavesurfer.un('ready', handleReady);
            wavesurfer.un('error', handleError);
            wavesurfer.un('finish', handleFinish);
        };
    }, [wavesurfer, mp3Url]);

    const play = () => {
        wavesurfer?.playPause();
        setIsPlaying(prev => !prev);
    };

    const onZoom = (value: number) => {
        wavesurfer?.zoom(value);
    };

    const onVolumeChange = (value: number) => {
        wavesurfer?.setVolume(value);
    };

    const buttonLabel = isPlaying ? translate('audio_player.pause') : translate('audio_player.play');
    const buttonType = isPlaying || hasError ? 'danger' : 'info';
    const buttonIcon = isPlaying ? 'pause' : 'play arrow';
    const buttonDisabled = hasError;

    return (
        <div className="waveform">
            {/* {isLoading && <Loader />} */}

            <div ref={waveContainerRef} className="wave"></div>

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
