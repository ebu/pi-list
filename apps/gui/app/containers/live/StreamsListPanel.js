import React, { Component } from 'react';
import _ from 'lodash';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import PropTypes from 'prop-types';

const appendEmptyStream = (streams) => {
    const newStreams = _.cloneDeep(streams);
    newStreams.push({ dstAddr: '', dstPort: '' });
    return newStreams;
};

class StreamsListPanel extends Component {
    constructor(props) {
        super(props);

        this.onDelete = this.onDelete.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    onDelete(index) {
        const newStreams = _.cloneDeep(this.props.streams);
        newStreams.splice(index, 1);
        this.updateStreams(newStreams);
    }

    onChange(index, attribute, value) {
        const newStreams = _.cloneDeep(this.props.streams);
        newStreams[index][attribute] = value;
        this.updateStreams(newStreams);
    }

    updateStreams(streams) {
        const newStreams = this.addTrailing(streams);
        this.props.handleChange(newStreams);
    }

    addTrailing(streams) {
        const lastIndex = streams.length - 1;

        while (streams.length > 0 && streams[streams.length - 1].dstAddr === '' && streams[streams.length - 1].dstPort === '') {
            streams.splice(streams.length - 1, 1);
        }

        return appendEmptyStream(streams);
    }

    render() {
        const { streams } = this.props;

        const rows = streams.map((stream, index) => (
            <div
            className="row"
            style={{alignItems: "baseline" }}
            key={`item-${index}`}
            >
                <div className="col-xs-6">
                    <Input
                        placeholder="Multicast address"
                        value={stream.dstAddr}
                        type="text"
                        onChange={(e) => this.onChange(index, 'dstAddr', e.target.value)}
                    />
                </div>

                <div className="col-xs-5">
                    <Input
                        placeholder="Port"
                        value={stream.dstPort}
                        type="text"
                        onChange={(e) => this.onChange(index, 'dstPort', e.target.value)}
                    />
                </div>

                <div className="col-xs-1">
                <Button
                    className="lst-table-delete-item-btn"
                    icon="delete"
                    type="danger"
                    link
                    onClick={() => this.onDelete(index)}
                />
                </div>
            </div>)
        );

        return (
            <div>
                {rows}
            </div>
        );
    }
}

StreamsListPanel.propTypes = {
    streams: PropTypes.arrayOf(PropTypes.object),
    handleChange: PropTypes.func,
};

StreamsListPanel.defaultProps = {
    streams: PropTypes.arrayOf(PropTypes.object),
    handleChange: () => { },
};

export default StreamsListPanel;
