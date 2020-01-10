import React from 'react';
import { Link } from 'react-router-dom';
import routeBuilder from '../../utils/routeBuilder';
import Icon from 'components/common/Icon';

const PTPCard = props => {
    const title = 'PTP';
    const icon = <Icon value="alarm" />;

    return (
        <Link to={routeBuilder.ptp_info_page(props.pcapID)} className="lst-href-no-style">
            <div className="lst-panel">
                <div className="lst-panel__container">
                    <div className="row lst-panel__header lst-truncate">
                        <h2 className="lst-no-margin">
                            {icon}
                            {title}
                        </h2>
                    </div>
                    <hr />
                    <p className="lst-paragraph col-xs-12">
                        <span className="lst-no-margin">PTP Stream</span>
                    </p>
                </div>
            </div>
        </Link>
    );
};

export default PTPCard;
