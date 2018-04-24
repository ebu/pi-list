import React from 'react';
import Rodal from 'rodal';
import Button from 'components/common/Button';
import Icon from 'components/common/Icon';

import 'rodal/lib/rodal.css';

const PopUp = (props) => {
    let label, message, buttons, header;
    const height = props.height || 140;
    const width = props.width || 400;

    switch (props.type) {
    case 'delete':
        label = `Delete ${props.resource}`;
        message = (
            <div className="lst-text-center">
                {props.message}
            </div>
        );
        header = (
            <h2 className="lst-text-red">
                <Icon value="warning" />
                <span>{label}</span>
            </h2>
        );
        buttons = [
            <Button key="cancel-btn" label="Cancel" outline noAnimation onClick={props.onClose} />,
            <Button
                key="delete-btn"
                label="Delete"
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
            height={height}
            width={width}
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

export default PopUp;
