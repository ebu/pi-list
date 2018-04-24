import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Icon from 'components/common/Icon';

const propTypes = {
    icon: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
};

const SectionHeader = props => (
    <Fragment>
        <h2>
            <Icon value={props.icon} />
            <span>{props.label}</span>
        </h2>
        <hr />
    </Fragment>
);

SectionHeader.propTypes = propTypes;

export default SectionHeader;
