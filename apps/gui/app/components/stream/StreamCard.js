import React from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import Panel from 'components/common/Panel';
import routeNames from 'config/routeNames';
import Icon from 'components/common/Icon';
import FormInput from 'components/common/FormInput';
import StreamBadge from 'components/stream/StreamBadge';
import AnalysisBadge from 'components/stream/AnalysisBadge';

function renderNeedsInfo() {
    const statusClassName = classNames('lst-stream-status', 'lst-stream-status--uncheck');

    return (
        <div className={statusClassName}>
            <Icon value="build" />
        </div>
    );
}

function renderStatus(isVideo) {
    if (isVideo) return null;

    const statusClassName = classNames('lst-stream-status', 'lst-stream-status--faded');
    return (
        <div className={statusClassName}>
            <Icon value="remove" />
        </div>
    );
}

const StreamCard = (props) => {
    const net = props.network_information;

    const from = `${net.source_address}:${net.source_port}`;
    const to = `${net.destination_address}:${net.destination_port}`;

    const needsInfo = props.state === 'needs_info';
    const isVideo = props.media_type === 'video';

    let route;

    if (needsInfo) {
        route = `${routeNames.PCAPS}/${props.pcapID}/${routeNames.STREAMS_PAGE}/${props.id}/${routeNames.CONFIGURE}`;
    } else {
        route = `${routeNames.PCAPS}/${props.pcapID}/${routeNames.STREAMS_PAGE}/${props.id}`;
    }

    return (
        <Link key={`streams-${props.id}`} to={route} className="lst-href-no-style">
            <Panel>
                <div className="row lst-no-margin">
                    <div className="row col-xs-9 lst-no-padding lst-no-margin">
                        <p className="lst-paragraph col-xs-12">
                            <h2 className="lst-no-margin">{props.title}</h2>
                        </p>
                        <FormInput className="lst-no-margin" icon="arrow upward" labelColSize={3} valueColSize={9}>
                            {from}
                        </FormInput>
                        <FormInput className="lst-no-margin" icon="arrow downward" labelColSize={3} valueColSize={9}>
                            {to}
                        </FormInput>
                    </div>
                    <div className="row col-xs-3 lst-no-padding lst-no-margin end-xs">
                        { needsInfo ? renderNeedsInfo() : renderStatus(isVideo) }
                    </div>
                </div>
                { !needsInfo && (
                    <div className="row lst-no-margin">
                        <StreamBadge media_type={props.media_type} media_specific={props.media_specific} />
                        {isVideo && <AnalysisBadge name="ST2110-21" compliance={props.global_video_analysis.compliance} />}
                    </div>
                )}
            </Panel>
        </Link>
    );
};

export default StreamCard;
