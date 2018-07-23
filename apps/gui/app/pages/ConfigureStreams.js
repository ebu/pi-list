import React, { Component } from 'react';
import StreamConfiguration from 'containers/StreamConfiguration';
import routeBuilder from 'utils/routeBuilder';

class ConfigureStreamsPage extends Component {
    constructor(props) {
        super(props);

        this.onStreamAnalyzed = this.onStreamAnalyzed.bind(this);
    }

    onStreamAnalyzed() {
        const { pcapID } = this.props.match.params;
        this.props.history.push(routeBuilder.pcap_stream_list(pcapID));
    }

    render() {
        const { pcapID, streamID } = this.props.match.params;

        return (
            <StreamConfiguration
                pcapID={pcapID}
                streamID={streamID}
                onStreamAnalyzed={this.onStreamAnalyzed}
            />
        );
    }
}

export default ConfigureStreamsPage;
