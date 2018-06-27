import React, { Component } from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import Panel from 'components/common/Panel';
import routeNames from 'config/routeNames';
import FormInput from 'components/common/FormInput';
import StreamBadge from 'components/stream/StreamBadge';
import AnalysisBadge from 'components/stream/AnalysisBadge';

class LiveStreamCard extends Component {
    render() {
        const net = this.props.network_information;

        const from = `${net.source_address}:${net.source_port}`;
        const to = `${net.destination_address}:${net.destination_port}`;

        const mediaTypeIsKnown = this.props.media_type !== 'unknown';
        const globalStatus = this.props.global_video_analysis;

        // todo: check if it's video or audio... audio will fail to render
        // todo: merge with StreamCard (right now it's almost copy-paste)

        const isLive = this.props.state === 'on_going_analysis';

        const route = `${routeNames.LIVE}/${routeNames.STREAMS_PAGE}/${this.props.id}`;

        const panelClassName = classNames('slow-fade-in', {
            inactive: !isLive
        });

        return (
            <Link key={`streams-${this.props.id}`} to={route} className="lst-href-no-style">
                <Panel containerClassName={panelClassName}>
                    <div className="row lst-no-margin">
                        <div className="col-xs-9 lst-no-padding lst-no-margin">
                            <div className="row">
                                <p className="lst-paragraph col-xs-12">
                                    <h2 className="lst-no-margin">{this.props.title}</h2>
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
                            <StreamBadge media_type={this.props.media_type} media_specific={this.props.media_specific}/>
                            <AnalysisBadge name="ST2110-21" compliance={globalStatus.compliance} />
                        </div>
                    )}
                </Panel>
            </Link>
        );
    }
}

export default LiveStreamCard;
