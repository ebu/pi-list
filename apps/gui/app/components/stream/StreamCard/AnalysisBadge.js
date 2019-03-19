import React from 'react';
import PropTypes from 'prop-types';
import Badge from '../../common/Badge';
import analysisConstants from '../../../enums/analysis';

function getBadgeType(value) {
    // TODO: remove this
    if (value === 'narrow' || value === 'narrow_linear') return 'success';
    if (value === analysisConstants.outcome.compliant) return 'success';
    else if (value === analysisConstants.outcome.not_compliant) return 'danger';
    return 'warning';
}

const AnalysisBadge = (props) => {
    const type = getBadgeType(props.compliance);

    return (
        <Badge
            icon="assignment"
            type={`${type}`}
            text={`${props.name}`}
            mini
            border
        />
    );
};

AnalysisBadge.propTypes = {
    name: PropTypes.string.isRequired,
    compliance: PropTypes.oneOf([
        analysisConstants.outcome.compliant,
        analysisConstants.outcome.not_compliant,
        'narrow', 'narrow_linear', 'wide', 'undefined'
    ]).isRequired
};

export default AnalysisBadge;
