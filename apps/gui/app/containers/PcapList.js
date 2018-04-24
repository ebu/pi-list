import React, { Component, Fragment } from 'react';
import moment from 'moment';
import api from 'utils/api';
import websocket from 'utils/websocket';
import immutable from 'utils/immutable';
import notifications from 'utils/notifications';
import asyncLoader from 'components/asyncLoader';
import PopUp from 'components/common/PopUp';
import Icon from 'components/common/Icon';
import Table from 'components/common/Table';
import routeNames from 'config/routeNames';
import Badge from 'components/common/Badge';
import ProgressBar from 'components/common/ProgressBar';
import websocketEventsEnum from 'enums/websocketEventsEnum';

class PcapList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            pcaps: this.props.pcaps,
            pcapSelected: null,
            showPcapDeleteModal: false
        };

        this.onPcapClick = this.onPcapClick.bind(this);
        this.showPcapDeleteModal = this.showPcapDeleteModal.bind(this);
        this.deletePcapFile = this.deletePcapFile.bind(this);
        this.hideDeleteModal = this.hideDeleteModal.bind(this);
        this.onPcapReceived = this.onPcapReceived.bind(this);
        this.onPcapProcessed = this.onPcapProcessed.bind(this);
        this.onDone = this.onDone.bind(this);
    }

    onPcapClick(rowData) {
        const route = `${routeNames.PCAPS}/${rowData.id}/${routeNames.STREAMS_PAGE}/`;
        window.appHistory.push(route);
        //this.props.history.push(route); // todo: replace the line above by this one
    }

    onPcapReceived(data) {
        this.setState({
            pcaps: [
                {
                    ...data,
                    stateLabel: 'Reading PCAP file...'
                },
                ...this.state.pcaps
            ]
        });
    }

    onPcapProcessed(data) {
        const pcaps = immutable.findAndUpdateElementInArray({ id: data.id }, this.state.pcaps, {
            ...data,
            stateLabel: 'Processing Streams...'
        });

        this.setState({ pcaps });
    }

    onDone(data) {
        const pcaps = immutable.findAndUpdateElementInArray({ id: data.id }, this.state.pcaps, {
            ...data,
            stateLabel: 'Done!'
        });

        this.setState({ pcaps });
    }

    showPcapDeleteModal(pcapData) {
        this.setState({ resourceName: pcapData.file_name, showPcapDeleteModal: true, pcapSelected: pcapData });
    }

    deletePcapFile() {
        api.deletePcap(this.state.pcapSelected.id)
            .then(() => {
                const pcaps = immutable.findAndRemoveElementInArray({ id: this.state.pcapSelected.id }, this.state.pcaps);

                this.setState({ pcaps });

                notifications.success({
                    title: 'PCAP file deleted',
                    message: `The ${this.state.pcapSelected.file_name} file was successfully deleted!`
                });
            })
            .catch(() => {
                notifications.error({
                    title: 'Error while deleting PCAP',
                    message: `The ${this.state.pcapSelected.file_name} file cannot be deleted!`
                });
            });
        this.hideDeleteModal();
    }

    hideDeleteModal() {
        this.setState({ showPcapDeleteModal: false });
    }

    componentDidMount() {
        websocket.on(websocketEventsEnum.PCAP.FILE_RECEIVED, this.onPcapReceived);
        websocket.on(websocketEventsEnum.PCAP.FILE_PROCESSED, this.onPcapProcessed);
        websocket.on(websocketEventsEnum.PCAP.ANALYZING, this.onPcapProcessed);
        websocket.on(websocketEventsEnum.PCAP.DONE, this.onDone);
    }

    componentWillUnmount() {
        websocket.off(websocketEventsEnum.PCAP.FILE_RECEIVED, this.onPcapReceived);
        websocket.off(websocketEventsEnum.PCAP.FILE_PROCESSED, this.onPcapProcessed);
        websocket.off(websocketEventsEnum.PCAP.ANALYZING, this.onPcapProcessed);
        websocket.off(websocketEventsEnum.PCAP.DONE, this.onDone);
    }

    render() {
        const showFirstFiveElements = this.props.showLastPcaps ? 5 : null;
        return (
            <React.Fragment>
                <Table
                    ref={table => this.pcapTable = table}
                    orderBy="date"
                    data={this.state.pcaps}
                    noItemsMessage="No PCAPs file found!"
                    rows={[
                        {
                            key: 'file_name',
                            header: 'PCAP',
                            value: 'file_name',
                            cellClassName: 'lst-truncate',
                            width: '25%'
                        },
                        {
                            key: 'analyzed',
                            header: '',
                            render: this.renderPcapStatusCell,
                            width: '45%'
                        },
                        {
                            key: 'date',
                            header: 'Date',
                            render: this.renderPcapDate,
                            width: '20%'
                        }
                    ]}
                    fixed
                    showFirstElements={showFirstFiveElements}
                    showActions
                    rowClickable
                    onRowClick={this.onPcapClick}
                    onItemDelete={this.showPcapDeleteModal}
                />
                <PopUp
                    type="delete"
                    visible={this.state.showPcapDeleteModal}
                    message={`Are you sure you want to delete ${this.state.resourceName} file?`}
                    resource="PCAP file"
                    onClose={this.hideDeleteModal}
                    onDelete={this.deletePcapFile}
                />
            </React.Fragment>
        );
    }

    renderPcapStatusCell(rowData) {
        return (
            <Fragment>
                {rowData.progress && rowData.progress < 100 ? (
                    <Fragment>
                        <div className="row lst-text-blue middle-xs lst-no-margin">
                            <Icon value="autorenew" className="spin" />
                            <span>{rowData.stateLabel}</span>
                        </div>
                        <ProgressBar percentage={rowData.progress} />
                    </Fragment>
                ) : (
                    <Fragment>
                        <Badge
                            className="lst-table-configure-sdp-badge"
                            type={rowData.analyzed ? 'success' : 'warning'}
                            text={rowData.analyzed ? 'Streams Analyzed' : 'Configure Streams'}
                            icon={rowData.analyzed ? 'done all' : 'warning'}
                        />
                        {rowData.offset_from_ptp_clock !== 0 && (
                            <Badge
                                className="lst-table-configure-sdp-badge"
                                type="success"
                                icon="timer"
                                text="PTP"
                            />
                        )}
                        <span className="stream-type-number">
                            <Icon value="videocam" /> {rowData.video_streams}
                        </span>
                        <span className="stream-type-number">
                            <Icon value="audiotrack" /> {rowData.audio_streams}
                        </span>
                        <span className="stream-type-number">
                            <Icon value="assignment" /> {rowData.anc_streams}
                        </span>
                        <span className="stream-type-number">
                            <Icon value="help" /> {rowData.total_streams - rowData.video_streams - rowData.audio_streams - rowData.anc_streams}
                        </span>
                    </Fragment>
                )}
            </Fragment>
        );
    }

    renderPcapDate(rowData) {
        return (
            <span>
                {moment(rowData.date).format('lll')}
            </span>
        );
    }
}

export default asyncLoader(PcapList, {
    asyncRequests: {
        pcaps: () => api.getPcaps()
    }
});
