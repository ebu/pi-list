import React from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import Panel from 'components/common/Panel';
import FormInput from 'components/common/FormInput';
import StreamBadge from 'components/stream/StreamBadge';
import AnalysisBadge from 'components/stream/AnalysisBadge';
import EditableField from 'components/common/EditableField';
import api from 'utils/api';
import routeBuilder from 'utils/routeBuilder';

const LiveStreamCard = (props) => {
    const net = props.network_information;

    const from = `${net.source_address}:${net.source_port}`;
    const to = `${net.destination_address}:${net.destination_port}`;

    const mediaTypeIsKnown = props.media_type !== 'unknown';
    const globalStatus = props.global_video_analysis;

    // todo: check if it's video or audio... audio will fail to render

    const isLive = props.state === 'on_going_analysis';

    const route = routeBuilder.live_stream_page(props.id);

    const panelClassName = classNames('slow-fade-in', {
        inactive: !isLive
    });

    const title = props.alias ? props.alias : props.title;

    return (
        <Link key={`streams-${props.id}`} to={route} className="lst-href-no-style">
            <Panel containerClassName={panelClassName}>
                <div className="row lst-no-margin">
                    <div className="col-xs-9 lst-no-padding lst-no-margin">
                        <div className="row">
                            <p className="lst-paragraph col-xs-12">
                                <h2 className="lst-no-margin">
                                    <EditableField
                                        value={title}
                                        className="lst-no-margin"
                                        updateFunction={data => api.changeLiveStreamName(props.id, { name: data })}
                                    />
                                </h2>
                            </p>
                            <FormInput className="lst-no-margin" icon="arrow upward" labelColSize={3} valueColSize={9}>
                                {from}
                            </FormInput>
                            <FormInput className="lst-no-margin" icon="arrow downward" labelColSize={3} valueColSize={9}>
                                {to}
                            </FormInput>
                        </div>
                    </div>
                </div>
                { mediaTypeIsKnown && (
                    <div className="row lst-no-margin">
                        <StreamBadge media_type={props.media_type} media_specific={props.media_specific}/>
                        <AnalysisBadge name="ST2110-21" compliance={globalStatus.compliance} />
                    </div>
                )}
            </Panel>
        </Link>
    );
};

export default LiveStreamCard;
