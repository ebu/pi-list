import React, { Component } from 'react';
import StreamConfiguration from 'containers/StreamConfiguration';
import routeNames from "../config/routeNames";

class ConfigureStreamsPage extends Component {
    constructor(props) {
        super(props);
    }

    onStreamAnalyzed() {
        const { pcapID } = this.props.match.params;
        const route = `${routeNames.PCAPS}/${pcapID}/${routeNames.STREAMS_PAGE}/`;
        this.props.history.push(route);
    }

    render() {
        const { pcapID, streamID } = this.props.match.params;

        return (
            <StreamConfiguration pcapID={pcapID} streamID={streamID} onStreamAnalyzed={this.onStreamAnalyzed.bind(this)}/>
        );
    }
}

export default ConfigureStreamsPage;
