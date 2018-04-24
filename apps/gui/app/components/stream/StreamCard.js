import React, { Component, Fragment } from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import Panel from 'components/common/Panel';
import routeNames from 'config/routeNames';
import Badge from 'components/common/Badge';
import Icon from 'components/common/Icon';
import FormInput from "../common/FormInput";

class StreamCard extends Component {
    renderVideoInfo() {
        const media = this.props.media_specific;

        const scan = media.scan_type === 'interlaced' ? 'i' : 'p';
        const rate_value = eval(media.rate);
        const rate_frac = rate_value - Math.floor(rate_value);

        const rate = rate_frac < 0.2 ? rate_value : rate_value.toFixed(2);

        return (
            <Fragment>
                <Badge text={`${media.height}${scan}${rate}`} icon="videocam" size="mini" />
                <Badge text={`${media.sampling} ${media.color_depth} bits`} icon="filter" size="mini" />
            </Fragment>
        );
    }

    renderAudioInfo() {
        const media = this.props.media_specific;
        const hz = media.sampling / 1000;

        return (
            <Fragment>
                <Badge text={`${media.encoding} ${media.number_channels}ch`} icon="queue music" size="mini" />
                <Badge text={`${hz} kHz`} icon="surround sound" size="mini" />
            </Fragment>
        );
    }

    renderInformation() {
        switch(this.props.media_type) {
            case 'video': return this.renderVideoInfo();
            case 'audio': return this.renderAudioInfo();
            default: return null;
        }
    }

    render() {
        const net = this.props.network_information;

        const from = `${net.source_address}:${net.source_port}`;
        const to = `${net.destination_address}:${net.destination_port}`;

        const needsInfo = this.props.state === 'needs_info';

        let route;

        if (needsInfo) {
            route = `${routeNames.PCAPS}/${this.props.pcapID}/${routeNames.STREAMS_PAGE}/${this.props.id}/${routeNames.CONFIGURE}`;
        } else {
            route = `${routeNames.PCAPS}/${this.props.pcapID}/${routeNames.STREAMS_PAGE}/${this.props.id}`;
        }

        const statusClassName = classNames('lst-stream-status', {
            'lst-stream-status--check': !needsInfo,
            'lst-stream-status--uncheck': needsInfo
        });

        return (
            <Link key={`streams-${this.props.id}`} to={route} className="lst-href-no-style">
                <Panel>
                    <div className="row lst-no-margin">
                        <div className="row col-xs-8 lst-no-padding lst-no-margin">
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
                        <div className="row col-xs-4 lst-no-padding lst-no-margin end-xs">
                            <div className={statusClassName}>
                                <Icon value={needsInfo ? 'build' : 'check'} />
                            </div>
                        </div>
                    </div>
                    { !needsInfo && (
                        <div className="row lst-no-margin">
                            {this.renderInformation()}
                        </div>
                    )}
                </Panel>
            </Link>
        );
    }
}

export default StreamCard;
