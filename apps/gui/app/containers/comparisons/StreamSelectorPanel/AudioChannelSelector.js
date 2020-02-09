import React from 'react';
import PropTypes from 'prop-types';
import Select from '../../../components/common/Select';
import { getTitleFor } from '../../../utils/mediaUtils';

const NoAudioChannelSelector = () => <div />;

const AudioChannelSelector = props => {
    const entries = props.channels.map(channel => ({
        label: `channel ${channel}`,
        value: channel,
    }));

    if (entries.length === 0) return <NoAudioChannelSelector />;

    return (
        <div className="row lst-align-items-center">
            <div className="col-xs-2">
                <div className="lst-text-right">Audio Channel:</div>
            </div>
            <div className="col-xs-10">
                <Select options={entries} value={props.selectedChannel} onChange={props.onChange} />
            </div>
        </div>
    );
};

AudioChannelSelector.propTypes = {
    channels: PropTypes.array,
    selectedChannel: PropTypes.number,
    onChange: PropTypes.func.isRequired,
};

AudioChannelSelector.defaultProps = {
    channels: [],
    selectedChannel: null,
};

export default AudioChannelSelector;
