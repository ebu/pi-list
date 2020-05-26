import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

const DataLine = props => (
    <div className="row col-xs-12 lst-no-padding">
        <div className={`lst-stream-info-label col-xs-${props.labelWidth}`}>
            <span>{props.label}</span>
        </div>
        <div className={`col-xs-${props.valueWidth}`}>
            <div style={{ display: 'flex' }}>
                <div className={props.attention ? 'lst-stream-info-value-attention' : 'lst-stream-info-value'}>
                    {props.value}
                </div>
                {props.units ? <div className="lst-stream-info-units"> {props.units} </div> : ''}
            </div>
        </div>
    </div>
);

DataLine.propTypes = {
    label: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.element]),
    units: PropTypes.string,
    labelWidth: PropTypes.number,
    valueWidth: PropTypes.number,
};

DataLine.defaultProps = {
    label: '',
    value: '',
    units: null,
    labelWidth: 6,
    valueWidth: 6,
};

export default DataLine;
