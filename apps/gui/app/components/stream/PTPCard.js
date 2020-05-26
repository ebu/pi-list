import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Icon from '../common/Icon';
import routeBuilder from '../../utils/routeBuilder';
import DataList from '../../containers/streamPage/components/DataList';

const PTPCard = props => {
    const title = 'PTP';
    const icon = <Icon value="alarm" />;

    const values = [];

    if (props.ptp.grandmaster_id) {
        values.push({
            label: 'Grand master',
            value: props.ptp.grandmaster_id,
        });
    }

    if (props.ptp.master_id) {
        values.push({
            label: 'Master',
            value: props.ptp.master_id,
        });
    }

    if (props.ptp.is_two_step !== undefined) {
        values.push({
            labelTag: 'ptp.clock_type',
            value: props.ptp.is_two_step ? 'Two step' : 'One step',
        });
    }

    if (props.ptp.average_offset !== undefined) {
        values.push({
            labelTag: 'ptp.average_offset',
            value: props.ptp.average_offset,
            units: 'ns',
        });
    }

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
                    <DataList labelWidth={6} valueWidth={6} values={values} />
                </div>
            </div>
        </Link>
    );
};

export const PtpInfoShape = PropTypes.shape({
    average_offset: PropTypes.number,
    grandmaster_id: PropTypes.string,
    is_two_step: PropTypes.bool,
    master_id: PropTypes.string,
});

PTPCard.propTypes = {
    ptp: PtpInfoShape.isRequired,
};

export default PTPCard;
