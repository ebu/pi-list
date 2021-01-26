import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { isFunction, throttle } from 'lodash';
import api from 'utils/api';
import Icon from 'components/common/Icon';
import asyncLoader from 'components/asyncLoader';
import { translateC } from 'utils/translation';

const propTypes = {
    pcapID: PropTypes.string.isRequired,
    streamID: PropTypes.string.isRequired,
    frames: PropTypes.arrayOf(PropTypes.object).isRequired,
    onFrameChange: PropTypes.func,
    initFrameIndex: PropTypes.number,
};

const defaultProps = {
    onFrameChange: null,
    initFrameIndex: -1
};

const VideoTimeline = (props) => {
    const [frameIndex, setFrameindex] = useState(props.initFrameIndex);

    useEffect(() => {
        if (isFunction(props.onFrameChange)) {
            const currentFrame = props.frames[frameIndex];
            props.onFrameChange(frameIndex, currentFrame);
        }
    }, [frameIndex]);

    const onClick = (event) => {
        setFrameindex(parseInt(event.target.alt));
    };

    /* would have been good to have arrow buttons in
     * "lst-video-timeline" but click events would conflict */
    // <a className="prev" onClick={onClick()}>&#10094;</a>
    // <a className="next" onClick=w{onNext()}>&#10095;</a>
    if (props.frames.length > 0) {
        return (
            <div className="lst-video-timeline">
                <div className="wrapper">
                    <div className="row">
                        {props.frames.map((frame, index) => {
                            const { pcapID, streamID } = props;
                            const imageClassName = classNames(
                                'col-xs-2',
                                'lst-video-timeline-image',
                                {
                                    'lst-hide': frame.hide,
                                    selected: frame.timestamp === props.frames[frameIndex].timestamp
                                }
                            );
                            const frameImageURL = api.getThumbnailFromStream(pcapID, streamID, frame.timestamp);

                            return (
                                <div className={imageClassName} key={frame.timestamp}>
                                    <img
                                        alt={`${index}`}
                                        src={frameImageURL}
                                        onClick={onClick}
                                    />
                                    <div>
                                        {`${index + 1}`}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    } else {
        return (
            <div className="col-xs-12">
                <h2 className="lst-text-dark-grey lst-text-center">
                    <Icon className="lst-center-icon" value="error outline" />
                    <span>{translateC('stream.no_frames')}</span>
                </h2>
            </div>
        );
    }
}

VideoTimeline.propTypes = propTypes;
VideoTimeline.defaultProps = defaultProps;

export default VideoTimeline;
