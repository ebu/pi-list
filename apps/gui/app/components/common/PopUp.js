import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Rodal from 'rodal';
import 'rodal/lib/rodal.css';
import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import { translateC } from '../../utils/translation';

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

class PopUp extends Component {
    constructor(props) {
        super(props);

        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    handleKeyPress(event) {
        switch (this.props.type) {
            case 'delete':
                if (event.keyCode == 13) {
                    this.props.onDelete();
                }
                break;
            default:
                break;
        }
    }

    render() {
        let message, buttons, header;

        switch (this.props.type) {
            case 'delete':
                message = (
                    <div className="lst-text-center">
                        {this.props.message}
                    </div>
                );
                header = (
                    <h2 className="lst-text-red">
                        <Icon value="warning" />
                        <span>{this.props.label}</span>
                    </h2>
                );
                buttons = [
                    <Button key="cancel-btn" label={translateC('buttons.cancel')} outline noAnimation onClick={this.props.onClose} />,
                    <Button
                        key="delete-btn"
                        label={translateC('buttons.delete')}
                        type="danger"
                        outline
                        noAnimation
                        onClick={this.props.onDelete}
                    />
                ];
                break;
            default:
                header = (
                    <h2>
                        <Icon value={this.props.icon} />
                        <span>{this.props.label}</span>
                    </h2>
                );
                message = this.props.component();
                break;
        }

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
