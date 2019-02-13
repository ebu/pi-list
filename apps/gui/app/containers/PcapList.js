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
import Badge from 'components/common/Badge';
import ProgressBar from 'components/common/ProgressBar';
import websocketEventsEnum from 'enums/websocketEventsEnum';
import { translate } from 'utils/translation';
import routeBuilder from 'utils/routeBuilder';

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
        this.onPcapFailed = this.onPcapFailed.bind(this);
        this.onDone = this.onDone.bind(this);
    }

    onPcapClick(rowData) {
        const route = routeBuilder.pcap_stream_list(rowData.id);
        window.appHistory.push(route);
        //this.props.history.push(route); // todo: replace the line above by this one
    }

    onPcapReceived(data) {
        this.setState({
            pcaps: [
                {
                    ...data,
                    stateLabel: translate('workflow.reading_pcap')
                },
                ...this.state.pcaps
            ]
        });
    }

    onPcapProcessed(data) {
        const pcaps = immutable.findAndUpdateElementInArray({ id: data.id }, this.state.pcaps, {
            ...data,
            stateLabel: translate('workflow.processing_streams')
        });

        this.setState({ pcaps });
    }

    onPcapFailed(data) {
        const pcaps = immutable.findAndUpdateElementInArray({ id: data.id }, this.state.pcaps, {
            ...data,
            stateLabel: translate('workflow.processing_streams')
        });

        this.setState({ pcaps });
    }

    onDone(data) {
        const pcaps = immutable.findAndUpdateElementInArray({ id: data.id }, this.state.pcaps, {
            ...data,
            stateLabel: translate('workflow.done')
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
                    title: translate('notifications.success.pcap_deleted'),
                    message: translate('notifications.success.pcap_deleted_message', { name: this.state.pcapSelected.file_name })
                });
            })
            .catch(() => {
                notifications.error({
                    title: translate('notifications.error.pcap_deleted'),
                    message: translate('notifications.error.pcap_deleted_message', { name: this.state.pcapSelected.file_name })
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
        websocket.on(websocketEventsEnum.PCAP.FILE_FAILED, this.onPcapFailed);
        websocket.on(websocketEventsEnum.PCAP.DONE, this.onDone);
    }

    componentWillUnmount() {
        websocket.off(websocketEventsEnum.PCAP.FILE_RECEIVED, this.onPcapReceived);
        websocket.off(websocketEventsEnum.PCAP.FILE_PROCESSED, this.onPcapProcessed);
        websocket.off(websocketEventsEnum.PCAP.ANALYZING, this.onPcapProcessed);
        websocket.off(websocketEventsEnum.PCAP.FILE_FAILED, this.onPcapFailed);
        websocket.off(websocketEventsEnum.PCAP.DONE, this.onDone);
    }

    render() {
        return (
            <React.Fragment>
                <Table
                    orderBy="date"
                    data={this.state.pcaps}
                    noItemsMessage={translate('pcap.no_pcaps')}
                    rows={[
                        {
                            key: 'file_name',
                            header: 'PCAP',
                            render: this.renderPcapFileName,
                            cellClassName: 'lst-truncate',
                            width: '30%'
                        },
                        {
                            key: 'analyzed',
                            header: '',
                            render: this.renderPcapStatusCell,
                            width: '45%'
                        },
                        {
                            key: 'date',
                            header: translate('date'),
                            render: this.renderPcapDate,
                            width: '20%'
                        }
                    ]}
                    fixed
                    showFirstElements={this.props.limit}
                    onRowClick={this.onPcapClick}
                    onItemDelete={this.showPcapDeleteModal}
                />
                <PopUp
                    type="delete"
                    visible={this.state.showPcapDeleteModal}
                    label={translate('pcap.delete_header')}
                    message={translate('pcap.delete_message', { name: this.state.resourceName })}
                    onClose={this.hideDeleteModal}
                    onDelete={this.deletePcapFile}
                />
            </React.Fragment>
        );
    }

    renderPcapStatusCell(rowData) {
        let stateText;
        let stateIcon;
        let stateType;

        if (rowData.error) {
            stateText = translate('pcap.state.failed');
            stateIcon = 'close';
            stateType = 'danger';
        } else if (!rowData.analyzed) {
            stateText = translate('pcap.state.needs_user_input');
            stateIcon = 'warning';
            stateType = 'warning';
        } else {
            const hasError = rowData.not_compliant_streams !== 0;

            if (rowData.total_streams === 0) {
                stateText = translate('pcap.state.no_analysis');
                stateIcon = 'info';
                stateType = 'info';
            } else if (hasError) {
                stateText = translate('pcap.state.not_compliant');
                stateIcon = 'close';
                stateType = 'danger';
            } else {
                stateText = translate('pcap.state.compliant');
                stateIcon = 'done all';
                stateType = 'success';
            }
        }

        if (rowData.error) {
            return (
                <Fragment>
                    <Badge
                        className="lst-table-configure-sdp-badge"
                        type={stateType}
                        text={stateText}
                        icon={stateIcon}
                    />
                </Fragment>
            );
        }
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
                                type={stateType}
                                text={stateText}
                                icon={stateIcon}
                            />
                            {rowData.offset_from_ptp_clock !== 0 && (
                                <Badge
                                    className="lst-table-configure-sdp-badge"
                                    type="success"
                                    icon="timer"
                                    text="PTP"
                                />
                            )}
                            {rowData.truncated && (
                                <Badge
                                    className="lst-table-configure-sdp-badge"
                                    type="warning"
                                    icon="warning"
                                    text={translate('pcap.truncated')}
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

    renderPcapFileName(rowData) {
        return rowData.generated_from_network ?
            <Fragment>
                {rowData.file_name}
                <Badge
                    className="lst-table-configure-sdp-badge"
                    type="info"
                    icon="settings_input_composite"
                />
            </Fragment> : rowData.file_name;
    }
}

export default asyncLoader(PcapList, {
    asyncRequests: {
        pcaps: () => api.getPcaps()
    }
});
