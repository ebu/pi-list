import React, { Fragment } from 'react';
import DataList from './DataList';
import { translateX } from 'utils/translation';

const InfoPane = props => {
    const heading = props.heading || translateX(props.headingTag);
    return (
        <Fragment>
            <div className="lst-stream-info-header">
                <i className="material-icons lst-stream-info-header-icon">{props.icon}</i>
                <span className="lst-stream-info-header-label">{heading}</span>
            </div>
            <hr />
            { props.comment? <div className="row lst-text-center lst-text-yellow"> {props.comment} </div> : '' }
            <DataList {...props} />
        </Fragment>
    );
};

export default InfoPane;
