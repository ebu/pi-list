import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Rodal from 'rodal';
import 'rodal/lib/rodal.css';
import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import { translateC } from '../../utils/translation';

const propTypes = {
    visible: PropTypes.bool.isRequired,
    onDoAction: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    height: PropTypes.number,
    width: PropTypes.number
};

const defaultProps = {
    height: 140,
    width: 400
};

/*
    Popup types:
        okcancel:
            Accept 2 actions, onClose for the cancel button and onDoAction for the Ok button
            The icon is a Warning triangle
        deletecancel:
            Accept 2 actions, onClose for the cancel button and onDoAction for the Delete button
            The icon is a warning triangle
        yesno:
            Accept 2 actions, onClose for the No button and onDoAction for the Yes button
            The icon is a Circle with a Quantion mark.
        ok:
            Accept 1 actions, onClose for the Ok
            The icon is a Circle witha Exclamation mark
*/


class PopUp extends Component {
    constructor(props) {
        super(props);

        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    handleKeyPress(event) {
        switch (this.props.type) {
            case 'okcancel':
            case 'deletecancel':
            case 'yesno':
                if (event.keyCode == 13) {
                    this.props.onDoAction();
                }
                break;
            case 'ok':
                if (event.keyCode == 13) {
                    this.props.onClose();
                }
            case 'warning':
                    if (event.keyCode == 13) {
                        this.props.onClose();
                    }
            break;
            default:
                break;
        }
    }

    render() {
        let message, buttons, header, iconlabel, headtextcolor;

        message = (
            <div className="lst-text-center">
                {this.props.message}
            </div>
        );

        switch (this.props.type) {
            case 'okcancel':
                iconlabel = "warning";
                headtextcolor = "lst-text-red";
                buttons = [
                    <Button key="cancel-btn" label={translateC('buttons.cancel')} outline noAnimation onClick={this.props.onClose} />,
                    <Button
                        key="do-action-btn"
                        label={translateC('buttons.ok')}
                        type="danger"
                        outline
                        noAnimation
                        onClick={this.props.onDoAction}
                    />
                ];
                break;
            case 'deletecancel':
                iconlabel = "warning";
                headtextcolor = "lst-text-red";
                buttons = [
                    <Button key="cancel-btn" label={translateC('buttons.cancel')} outline noAnimation onClick={this.props.onClose} />,
                    <Button
                        key="do-action-btn"
                        label={translateC('buttons.delete')}
                        type="danger"
                        outline
                        noAnimation
                        onClick={this.props.onDoAction}
                    />
                ];
                break;
            case 'yesno':
                iconlabel = "help";
                headtextcolor = "lst-text-white";
                buttons = [
                    <Button key="cancel-btn" label={translateC('buttons.no')} outline noAnimation onClick={this.props.onClose} />,
                    <Button
                        key="do-action-btn"
                        label={translateC('buttons.yes')}
                        type="danger"
                        outline
                        noAnimation
                        onClick={this.props.onDoAction}
                    />
                ];
                break;
            case 'ok':
                iconlabel = "info";
                headtextcolor = "lst-text-blue";
                buttons = [
                    <Button key="cancel-btn" label={translateC('buttons.ok')} outline noAnimation onClick={this.props.onClose} />,
                ];
                break;
            case 'warning':
                iconlabel = "warning";
                headtextcolor = "lst-text-red";
                buttons = [
                    <Button key="cancel-btn" label={translateC('buttons.ok')} outline noAnimation onClick={this.props.onClose} />,
                ];
                break;
            default:
                iconlabel = "info";
                headtextcolor = "lst-text-red";
                message = this.props.component();
                break;        
        }

        header = (
            <h2 className={headtextcolor}>
                <Icon value={iconlabel} />
                <span>{this.props.label}</span>
            </h2>
        );



        return (
            <div onKeyUp={this.handleKeyPress}>
                <Rodal
                    className="lst-popup"
                    visible={this.props.visible}
                    animation="slideDown"
                    closeOnEsc
                    onClose={this.props.onClose}
                    height={this.props.height}
                    width={this.props.width}
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
            </div>
        );
    }
}

PopUp.propTypes = propTypes;
PopUp.defaultProps = defaultProps;

export default PopUp;
