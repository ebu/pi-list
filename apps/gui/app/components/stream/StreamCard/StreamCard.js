import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import Icon from 'components/common/Icon';
import routeBuilder from 'utils/routeBuilder';
import StreamBadge from './StreamBadge';
import AnalysisBadge from './AnalysisBadge';
import DataList from '../../../containers/streamPage/components/DataList';

const getValidationBadges = props => {
    if (props.state !== 'needs_info') return [];
    const mediaTypeValidationList = _.get(props, 'media_type_validation', []);
    return Object.keys(mediaTypeValidationList)
        .sort()
        .map(error_codes => {
            const compliance = 'undefined';
            const name = error_codes;
            const title = mediaTypeValidationList[error_codes];
            return <AnalysisBadge key={error_codes} name={name} compliance={compliance} title={title} />;
        });
};

const StreamCard = props => {
    const net = props.network_information;

    const from_mac = `${net.source_mac_address}`.toUpperCase();
    const to_mac = `${net.destination_mac_address}`.toUpperCase();
    const from = `${net.source_address}:${net.source_port}`;
    const to = `${net.destination_address}:${net.destination_port}`;

    const needsInfo = props.state === 'needs_info' || props.state === 'ready';

    let route;

    if (needsInfo) {
        route = routeBuilder.stream_config_page(props.pcapID, props.id);
    } else {
        route = routeBuilder.stream_page(props.pcapID, props.id);
    }

    const analyses = _.get(props, 'analyses', []);

    const compliantBadge = Object.keys(analyses).filter(analysis => analyses[analysis].result === 'compliant').length;
    const compliantName = `${compliantBadge} compliant`;
    const notCompliantBadge = Object.keys(analyses).length - compliantBadge;
    const notCompliantName = `${notCompliantBadge} not compliant`;

    const badges = (
        <div>
            <AnalysisBadge key="compliant" name={compliantName} compliance="compliant" />
            {notCompliantBadge > 0 && (
                <AnalysisBadge key="not-compliant" name={notCompliantName} compliance="not_compliant" />
            )}
        </div>
    );

    const badgesMediaTypeValidation = getValidationBadges(props);

    const netValues = [
        {
            label: 'S',
            value: `${from} / ${from_mac}`,
        },
        {
            label: 'D',
            value: `${to} / ${to_mac}`,
        },
    ];

    const netInfo = <DataList labelWidth={1} valueWidth={11} values={netValues} />;

    return (
        <Link key={`streams-${props.id}`} to={route} className="lst-href-no-style">
            <div className="lst-panel">
                <div className="lst-panel__container">
                    <div className="row lst-panel__header lst-truncate">
                        <h2 className="row lst-no-margin" style={{ width: '100%'}}>
                            <div className="col-xs-2">{props.icon && <Icon value={props.icon} />}</div>
                            <div className="col-xs-10 lst-text-right">{props.title}</div>
                        </h2>
                    </div>
                    <hr />
                    <div className="row lst-no-margin lst-font-size-08">
                        <div className="row col-xs-10 lst-no-padding lst-no-margin">{netInfo}</div>
                    </div>
                    <div className="col-xs-12 col-md-12">
                        <StreamBadge media_type={props.media_type} media_specific={props.media_specific} />
                    </div>
                    <div className="col-xs-12 col-md-12">{badges}</div>
                    <div className="col-xs-12 col-md-12">{badgesMediaTypeValidation}</div>
                </div>
            </div>
        </Link>
    );
};

StreamCard.propTypes = {
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
};

StreamCard.defaultProps = {};

export default StreamCard;
