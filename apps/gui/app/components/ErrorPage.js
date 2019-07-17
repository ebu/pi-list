import React from 'react';
import { isObject } from 'lodash';
import Button from 'components/common/Button';
import Icon from 'components/common/Icon';
import errorEnum from 'enums/errorEnum';
import { translateX, translateC } from 'utils/translation';

function getButtonLabelForErrorType(errorType) {
    switch (errorType) {
        case errorEnum.NETWORK_ERROR:
            return translateC('buttons.reload_page');
        case errorEnum.PAGE_NOT_FOUND:
        case errorEnum.NO_STREAMS:
            return translateC('buttons.go_back');
        default:
            return '';
    }
}

function buttonActionByErrorType(errorType) {
    switch (errorType) {
        case errorEnum.NETWORK_ERROR:
            return window.location.reload();
        case errorEnum.PAGE_NOT_FOUND:
        case errorEnum.NO_STREAMS:
            return window.history.back();
        default:
            return null;
    }
}

const ErrorPage = props => {
    const showButton =
        props.errorType === errorEnum.NETWORK_ERROR ||
        props.errorType === errorEnum.PAGE_NOT_FOUND ||
        props.errorType === errorEnum.NO_STREAMS ||
        isObject(props.button);

    const icon = props.icon || 'error outline';
    const title =
        props.errorType !== undefined
            ? translateX(props.errorType)
            : props.title;

    const errorMessage =
        props.errorMessage || translateX(props.errorMessageTag);
    return (
        <div className="lst-error-page row center-xs">
            <div className="col-xs-12 col-lg-6">
                <div className="box">
                    <div className="row middle-xs">
                        <div className="lst-error-page__icon col-xs-12 col-sm-3 right-xs lst-text-right lst-hide-xs">
                            <Icon className="lst-icons" value={icon} />
                        </div>
                        <div className="lst-error-page__message lst-text-left col-xs-12 col-sm-9">
                            <h2 className="lst-error-page-heading">{title}</h2>
                            <p>{errorMessage}</p>
                        </div>
                    </div>
                    {showButton && (
                        <div className="row center-xs">
                            <Button
                                type="info"
                                label={
                                    isObject(props.button)
                                        ? props.button.label
                                        : getButtonLabelForErrorType(
                                              props.errorType
                                          )
                                }
                                onClick={
                                    isObject(props.button)
                                        ? () =>
                                              props.button.onClick(
                                                  props.originalProps
                                              )
                                        : () =>
                                              buttonActionByErrorType(
                                                  props.errorType
                                              )
                                }
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ErrorPage;
