import React from 'react';
import { Link } from 'react-router-dom';
import Panel from 'components/common/Panel';
import routeBuilder from 'utils/routeBuilder';

const PTPCard = (props) => {
    return (
        <Link key={`streams-${props.id}`} to={routeBuilder.ptp_info_page(props.pcapID)} className="lst-href-no-style">
            <Panel>
                <div className="row lst-no-margin">
                    <div className="row col-xs-8 lst-no-padding lst-no-margin">
                        <p className="lst-paragraph col-xs-12">
                            <h2 className="lst-no-margin">PTP Stream</h2>
                        </p>
                    </div>
                </div>
            </Panel>
        </Link>
    );
};

export default PTPCard;
