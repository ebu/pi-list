import React from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import Panel from 'components/common/Panel';
import Icon from 'components/common/Icon';
import routeBuilder from 'utils/routeBuilder';

const PTPCard = (props) => {
    const statusClassName = classNames('lst-stream-status', 'lst-stream-status--check');

    return (
        <Link key={`streams-${props.id}`} to={routeBuilder.ptp_info_page(props.pcapID)} className="lst-href-no-style">
            <Panel>
                <div className="row lst-no-margin">
                    <div className="row col-xs-8 lst-no-padding lst-no-margin">
                        <p className="lst-paragraph col-xs-12">
                            <h2 className="lst-no-margin">PTP Stream</h2>
                        </p>
                    </div>
                    <div className="row col-xs-4 lst-no-padding lst-no-margin end-xs">
                        <div className={statusClassName}>
                            <Icon value="check" />
                        </div>
                    </div>
                </div>
            </Panel>
        </Link>
    );
};

export default PTPCard;
