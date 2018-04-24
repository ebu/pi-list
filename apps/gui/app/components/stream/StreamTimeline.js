import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { isFunction, throttle } from 'lodash';
import api from 'utils/api';
import Icon from 'components/common/Icon';

const propTypes = {
    pcapID: PropTypes.string.isRequired,
    streamID: PropTypes.string.isRequired,
    frames: PropTypes.arrayOf(PropTypes.object).isRequired,
    onFrameChange: PropTypes.func
};

const defaultProps = {
    onFrameChange: null
};

class StreamTimeline extends Component {
    constructor(props) {
        super(props);

        this.state = {
            frameIndex: 0,
            currentFrame: this.props.frames[0],
            currentFramesWindow: [],
            totalFrame: this.props.frames.length
        };

        this.onNavigationKeyDown = this.onNavigationKeyDown.bind(this);
    }

    componentDidMount() {
        document.addEventListener('keydown', throttle(this.onNavigationKeyDown, 180));

        this.updateFrameNavBar(0, this.props.frames.length);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.onNaviagtionKeyDown);
    }

    onNavigationKeyDown(event) {
        let frameIndex = this.state.frameIndex;
        const lastFrame = this.props.frames.length - 1;

        if (event.key === 'ArrowLeft' && frameIndex > 0) {
            frameIndex -= 1;
            this.updateFrameNavBar(frameIndex, lastFrame);
        } else if (event.key === 'ArrowRight' && frameIndex < lastFrame) {
            frameIndex += 1;
            this.updateFrameNavBar(frameIndex, lastFrame);
        }
    }

    updateFrameNavBar(frameIndex, lastFrame) {
        const WINDOW_SIZE = 8;
        const VISIBLE_WINDOW_SIZE = 6;
        const currentFrame = this.props.frames[frameIndex];

        let currentFramesWindow = [];

        if (frameIndex >= 0 && frameIndex < VISIBLE_WINDOW_SIZE - 3) {
            currentFramesWindow = this.props.frames
                .slice(0, WINDOW_SIZE)
                .map((frame, index) => {
                    return Object.assign({}, frame, {
                        hide: (index === VISIBLE_WINDOW_SIZE || index === VISIBLE_WINDOW_SIZE + 1)
                    });
                });
        } else if (frameIndex > (lastFrame - (VISIBLE_WINDOW_SIZE - 2)) && frameIndex <= lastFrame) {
            currentFramesWindow = this.props.frames
                .slice((lastFrame - 1) - VISIBLE_WINDOW_SIZE, lastFrame + 1)
                .map((frame, index) => {
                    return Object.assign({}, frame, {
                        hide: (index === 0 || index === 1)
                    });
                });

        } else {
            currentFramesWindow = this.props.frames
                .slice(frameIndex - 3, frameIndex + (VISIBLE_WINDOW_SIZE - 1))
                .map((frame, index) => {
                    return Object.assign({}, frame, {
                        hide: (index === 0 || index === VISIBLE_WINDOW_SIZE + 1)
                    });
                });
        }

        this.setState({ frameIndex, currentFrame, currentFramesWindow });

        if (isFunction(this.props.onFrameChange)) {
            this.props.onFrameChange(currentFrame);
        }
    }

    render() {
        const streamPercentage = ((this.state.frameIndex) / (this.state.totalFrame - 1)) * 100;

        if (this.state.currentFramesWindow.length > 0) {
            return (
                <div className="lst-stream-timeline">
                    <div className="row">
                        {this.state.currentFramesWindow.map((frame) => {
                            const { pcapID, streamID } = this.props;
                            const imageClassName = classNames(
                                'col-xs-2',
                                'lst-stream-timeline-image',
                                {
                                    'lst-hide': frame.hide,
                                    selected: frame.timestamp === this.state.currentFrame.timestamp
                                }
                            );
                            const frameImageURL = api.getImageFromStream(pcapID, streamID, frame.timestamp);

                            return (
                                <div className={imageClassName} key={frame.timestamp}>
                                    <img
                                        alt={`frame ${frame.timestamp}`}
                                        src={frameImageURL}
                                    />
                                </div>
                            );
                        })}
                    </div>
                    <div className="lst-timeline-bar row">
                        <div className="lst-timeline-progress" style={{ width: `${streamPercentage}%` }} />
                    </div>
                </div>
            );
        }

        return (
            <div className="col-xs-12">
                <h2 className="lst-text-dark-grey lst-text-center">
                    <Icon className="lst-center-icon" value="error outline" />
                    <span>Stream without frames</span>
                </h2>
            </div>
        );
    }
}

StreamTimeline.propTypes = propTypes;
StreamTimeline.defaultProps = defaultProps;

export default StreamTimeline;
