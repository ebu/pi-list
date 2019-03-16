import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

const propTypes = {
    label: PropTypes.string,
    value: PropTypes.oneOf([PropTypes.string, PropTypes.number]),
    units: PropTypes.string,
    labelWidth: PropTypes.number,
    valueWidth: PropTypes.number,
};
const defaultProps = {
    label: '',
    value: '',
    units: null,
    labelWidth: 6,
    valueWidth: 6,
};

const renderValue = ({ value, units }) => units
    ? <Fragment>
        <span className="lst-stream-info-value">{value}</span>
        <span className="lst-stream-info-units">{units}</span>
    </Fragment>
    : <span className="lst-stream-info-value">{value}</span>;

const DataLine = props => (
    <div className="row lst-control-group">
        <div className={`lst-stream-info-label col-xs-${props.labelWidth} middle-xs`}>
            <span>{props.label}</span>
        </div>
        <div className={`lst-form-value col-xs-${props.valueWidth} middle-xs`}>
            {renderValue(props)}
        </div>
    </div>
);

DataLine.propTypes = propTypes;
DataLine.defaultProps = defaultProps;

export default DataLine;
