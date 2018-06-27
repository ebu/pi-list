import React from 'react';
import WaveSurfer from 'wavesurfer.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.timeline.min.js';
import PropTypes from 'prop-types';
import Button from 'components/common/Button';
import Loader from 'components/common/Loader';
import { translate } from 'utils/translation';

const propTypes = {
    src: PropTypes.string.isRequired,
    timeline: PropTypes.bool,
};

const defaultProps = {
    timeline: false
};

class AudioPlayer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            isPlaying: false
        };

        this.play = this.play.bind(this);
    }

    componentDidMount() {
        const element = this.waveformComponent;
        const waveform = element.querySelector('.wave');

        const plugins = [];
        if (this.props.timeline) {
            plugins.push(TimelinePlugin.create({ container: '.wave-timeline' }));
        }

        this.wavesurfer = WaveSurfer.create({
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

        this.wavesurfer.load(this.props.src);

        this.wavesurfer.on('ready', () => {
            this.setState({ loading: false });
        });

        this.wavesurfer.on('finish', () => {
            this.setState({ isPlaying: false });
        });
    }

    componentWillUnmount() {
        this.wavesurfer.destroy();
    }

    play() {
        this.wavesurfer.playPause();

        this.setState(prevState => ({
            isPlaying: !prevState.isPlaying
        }));
    }

    render() {
        const buttonLabel = this.state.isPlaying ? translate('audio_player.pause') : translate('audio_player.play');
        const buttonType = this.state.isPlaying ? 'danger' : 'info';
        const buttonIcon = this.state.isPlaying ? 'pause' : 'play arrow';

        return (
            <div ref={ref => this.waveformComponent = ref} className="waveform center-xs middle-xs">
                { this.state.loading && <Loader />}
                <div className="wave" />
                <div className="wave-timeline" />
                { !this.state.loading &&
                <Button type={buttonType} label={buttonLabel} icon={buttonIcon} outline onClick={this.play} /> }
            </div>
        );
    }
}

AudioPlayer.propTypes = propTypes;
AudioPlayer.defaultProps = defaultProps;

export default AudioPlayer;
