import React from 'react';
import PropTypes from 'prop-types';
import Badge from 'components/common/Badge';

const propTypes = {
    name: PropTypes.string.isRequired,
    compliance: PropTypes.oneOf(['narrow', 'narrow_linear', 'wide', 'not_compliant', 'undefined']).isRequired
};

function getBadgeType(value) {
    if (value === 'narrow' || value === 'narrow_linear') return 'success';
    else if (value === 'not_compliant') return 'danger';
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
        />
    );
};

AnalysisBadge.propTypes = propTypes;

export default AnalysisBadge;
