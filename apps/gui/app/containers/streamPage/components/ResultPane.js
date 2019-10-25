import React, { Fragment } from 'react';
import InfoPane from './InfoPane';

const ResultPane = props => {

    return (
        <Fragment>
            <div className="row">
                <div className="col-xs-6">
                    <div className="lst-stream-info2-header">Measurement</div>
                    <hr className="lst-no-margin lst-stream-info2-divider" />
                </div>
                <div className="col-xs-6">
                    <div className="lst-stream-info2-header">Pass Criteria</div>
                    <hr className="lst-no-margin lst-stream-info2-divider" />
                </div>
            </div>

            {
                props.values.map(item => {
                    return (
                        <div className="row">
                            <div className="col-xs-6">
                                {item.measurement}
                            </div>
                            <div className="col-xs-6">
                                {item.limit}
                            </div>
                        </div>
                    );
                })
            }
        </Fragment>
    );
};

export default ResultPane;
