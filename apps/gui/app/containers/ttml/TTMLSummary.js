import _ from 'lodash';
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import InfoPane from '../streamPage/components/InfoPane';

const TTMLSummary = props => {
    const streamInfo = props.streamInfo;

    const notPresent = 'null';

    const n_subtitles = _.get(streamInfo, ['media_specific', 'data', 'length'], '');
    const timeBase = _.get(streamInfo, ['media_specific', 'data', '0', 'timeBase'], notPresent);
    const sequenceIdentifier = _.get(streamInfo, ['media_specific', 'data', '0', 'sequenceIdentifier'], notPresent);

    const values = [
        {
            labelTag: 'ttml.number_of_subtitles',
            value: n_subtitles,
        },
        {
            labelTag: 'ttml.time_base',
            value: timeBase,
            attention: timeBase !== 'media',
        },
        {
            labelTag: 'ttml.sequence_identifier',
            value: sequenceIdentifier,
            attention: sequenceIdentifier === notPresent,
        },
    ];

    return <InfoPane icon="assignment" headingTag="headings.ttml" values={values} />;
};

TTMLSummary.propTypes = {
    streamInfo: PropTypes.object.isRequired,
};

TTMLSummary.defaultProps = {};

export default TTMLSummary;
