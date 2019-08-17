import React from 'react';
import classNames from 'classnames';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import Panel from 'components/common/Panel';
import Icon from 'components/common/Icon';
import StreamBadge from './StreamBadge';
import AnalysisBadge from './AnalysisBadge';
import routeBuilder from 'utils/routeBuilder';
import analysisConstants from '../../../enums/analysis';
import DataList from '../../../containers/streamPage/components/DataList';

function renderNeedsInfo() {
    const statusClassName = classNames('lst-stream-status', 'lst-stream-status--uncheck');

    return (
        <div className={statusClassName}>
            <Icon value="build" />
        </div>
    );
}

const StreamCard = (props) => {
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
    const badges = Object.keys(analyses).sort().map(analysis => {
        const compliance = analyses[analysis].result;
        const name = analysisConstants.analysesNames[analysis];
        return (<AnalysisBadge key={analysis} name={name} compliance={compliance} />);
    });

    const netValues = [
        {
            label: 'S',
            value: from + ' / ' + from_mac
        },
        {
            label: 'D',
            value: to + ' / ' + to_mac
        },
    ];

    const netInfo = (<DataList labelWidth={1} valueWidth={11} values={netValues} />);


    return (
        <Link key={`streams-${props.id}`} to={route} className="lst-href-no-style">
            <Panel>
                <div className="row lst-no-margin lst-font-size-08">
                    <div className="row col-xs-12 lst-no-padding lst-no-margin">
                        {netInfo}
                    </div>
                    <div className="row col-xs-3 lst-no-padding lst-no-margin end-xs">
                        { needsInfo && renderNeedsInfo() }
                    </div>
                </div>
                { !needsInfo && (
                    <div className="row lst-no-margin">
                        <StreamBadge media_type={props.media_type} media_specific={props.media_specific} />
                        { badges }
                    </div>
                )}
            </Panel>
        </Link>
    );
};

export default StreamCard;
