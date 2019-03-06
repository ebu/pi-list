import React, { Fragment } from 'react';
import DataList from './DataList';
import { translate } from 'utils/translation';

const InfoPane = props => {
    const heading = props.heading || translate(props.headingTag);
    return (
        <Fragment>
            <div className="lst-stream-info-header">
                <i className="material-icons lst-stream-info-header-icon">{props.icon}</i>
                <span className="lst-stream-info-header-label">{heading}</span>
            </div>
            <hr />
            <DataList {...props} />
        </Fragment>
    );
};

export default InfoPane;
