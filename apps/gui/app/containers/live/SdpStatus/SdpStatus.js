import React, { Component } from 'react';
import _ from 'lodash';
import Icon from '../../../components/common/Icon';
import './SdpStatus.scss';

const SdpStatus = ({ errors }) => {
    if (errors === null || errors === undefined) {
        return null;
    }

    if (errors.length === 0) {
        return (
            <div className="lst-sdp-result-pane">
                <div className="lst-sdp-result-pane-header">
                    <Icon className="lst-color-ok lst-margin--right-05" value="done_all" />
                    <span>SDP OK</span>
                </div>
            </div>
        );
    }

    const lines = errors.map((e, index) => (
        <div className="lst-sdp-error-line" key={index}>
            {e}
        </div>
    ));

    return (
        <div className="lst-sdp-result-pane">
            <div className="lst-sdp-result-pane-header">
                <Icon className="lst-sdp-result-pane-error-icon" value="close" />
                <span>SDP has errors</span>
            </div>
            {lines}
        </div>
    );
};

export default SdpStatus;
