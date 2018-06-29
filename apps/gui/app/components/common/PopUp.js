import React from 'react';
import PropTypes from 'prop-types';
import Rodal from 'rodal';
import Button from 'components/common/Button';
import Icon from 'components/common/Icon';
import 'rodal/lib/rodal.css';
import { translate } from 'utils/translation';

const propTypes = {
    visible: PropTypes.bool.isRequired,
    onDelete: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    height: PropTypes.number,
    width: PropTypes.number
};

const defaultProps = {
    height: 140,
    width: 400
};

const PopUp = (props) => {
    let message, buttons, header;

    switch (props.type) {
    case 'delete':
        message = (
            <div className="lst-text-center">
                {props.message}
            </div>
        );
        header = (
            <h2 className="lst-text-red">
                <Icon value="warning" />
                <span>{props.label}</span>
            </h2>
        );
        buttons = [
            <Button key="cancel-btn" label={translate('buttons.cancel')} outline noAnimation onClick={props.onClose} />,
            <Button
                key="delete-btn"
                label={translate('buttons.delete')}
                type="danger"
                outline
                noAnimation
                onClick={props.onDelete}
            />
        ];
        break;
    default:
        header = (
            <h2>
                <Icon value={props.icon} />
                <span>{props.label}</span>
            </h2>
        );
        message = props.component();
        break;
    }

    return (
        <Rodal
            className="lst-popup"
            visible={props.visible}
            animation="slideDown"
            closeOnEsc
            onClose={props.onClose}
            height={props.height}
            width={props.width}
            closeMaskOnClick={false}
        >
            <div className="lst-popup__header">
                {header}
            </div>
            <div className="lst-popup__content">
                {message}
            </div>
            <div className="lst-popup__footer">
                {buttons}
            </div>
        </Rodal>
    );
};

PopUp.propTypes = propTypes;
PopUp.defaultProps = defaultProps;

export default PopUp;
