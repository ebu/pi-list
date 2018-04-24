import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Icon from 'components/common/Icon';

const propTypes = {
    label: PropTypes.string,
    labelColSize: PropTypes.number,
    valueColSize: PropTypes.number,
    icon: PropTypes.string
};
const defaultProps = {
    labelColSize: 4,
    valueColSize: 8,
    label: '',
    icon: '',
};

const FormInput = props => (
    <div className={classNames('lst-control-group col-xs-12', props.className)}>
        <div className={`lst-form-label col-xs-${props.labelColSize} middle-xs`}>
        {props.icon && (
                <Icon value={props.icon} />
            )}
            <strong>{props.label}</strong>
        </div>
        <div className="lst-form-value col-xs-8 middle-xs">
            {props.children}
        </div>
    </div>
);

FormInput.propTypes = propTypes;
FormInput.defaultProps = defaultProps;

export default FormInput;
