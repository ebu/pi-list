import React from 'react';
import PropTypes from 'prop-types';
import Select from '../../../components/common/Select';
import { getTitleFor } from '../../../utils/mediaUtils';

const NoStreamSelector = () => <div />;

const getFullTitleFor = (stream, index) => (`${getTitleFor(stream, index)} - ${stream.network_information.destination_address}`);

const StreamSelector = props => {
    const entries = props.streams.map((stream, index) => ({
        label: getFullTitleFor(stream, index),
        value: stream.id,
    }));

    if (entries.length === 0) return <NoStreamSelector />;

    return (
        <div className="row lst-align-items-center">
            <div className="col-xs-2">
                <div className="lst-text-right">Stream:</div>
            </div>
            <div className="col-xs-10">
                <Select options={entries} value={props.selectedStreamId} onChange={props.onChange} />
            </div>
        </div>
    );
};

StreamSelector.propTypes = {
    streams: PropTypes.array,
    selectedStreamId: PropTypes.string,
    onChange: PropTypes.func.isRequired,
};

StreamSelector.defaultProps = {
    streams: [],
    selectedStreamId: null,
};

export default StreamSelector;
