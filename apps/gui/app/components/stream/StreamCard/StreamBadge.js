import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Badge from 'components/common/Badge';

const propTypes = {
    media_type: PropTypes.string.isRequired,
    media_specific: PropTypes.object.isRequired
};

function renderVideoInfo(media) {
    const scan = media.scan_type === 'interlaced' ? 'i' : 'p';
    const rate_value = eval(media.rate);
    const rate_frac = rate_value - Math.floor(rate_value);

    const rate = rate_frac < 0.2 ? rate_value : rate_value.toFixed(2);

    return (
        <Fragment>
            <Badge border text={`${media.height}${scan}${rate}`} icon="videocam" mini />
            <Badge border text={`${media.sampling} ${media.color_depth} bits`} icon="filter" mini />
        </Fragment>
    );
}

function renderAudioInfo(media) {
    const hz = media.sampling / 1000;

    return (
        <Fragment>
            <Badge border text={`${media.encoding} ${media.number_channels}ch`} icon="queue music" mini />
            <Badge border text={`${hz} kHz`} icon="surround sound" mini />
        </Fragment>
    );
}

const StreamBadge = (props) => {
    switch (props.media_type) {
    case 'video': return renderVideoInfo(props.media_specific);
    case 'audio': return renderAudioInfo(props.media_specific);
    default: return null;
    }
};

StreamBadge.propTypes = propTypes;

export default StreamBadge;
