import React, { Component, Fragment } from 'react';
import 'react-table/react-table.css';
import PropTypes from 'prop-types';
import api from '../utils/api';
import websocket from '../utils/websocket';
import immutable from '../utils/immutable';
import notifications from '../utils/notifications';
import asyncLoader from '../components/asyncLoader';
import PopUp from '../components/common/PopUp';
import websocketEventsEnum from '../enums/websocketEventsEnum';
import { translate, translateX } from '../utils/translation';
import routeBuilder from '../utils/routeBuilder';
import PcapTable from '../components/pcap/PcapTable';
import PcapActions from '../components/pcap/PcapActions';
import pcapEnums from '../enums/pcap';
import { downloadFiles } from '../utils/download';

const DeleteModal = (props) => (
    <PopUp
        type="delete"
        visible={props.data !== null && props.data.length > 0}
        label={translateX('pcap.delete_header')}
        message={translateX('pcap.delete_message', { name: props.data ? props.data.length : 0 })}
        onClose={() => props.onAction([])}
        onDelete={() => props.onAction(props.data)}
    />
);

DeleteModal.propTypes = {
    data: PropTypes.arrayOf(PropTypes.string),
    onAction: PropTypes.func
};

DeleteModal.defaultProps = {
    data: [],
    onAction: () => { },
};

function getFullInfoFromId(id, pcaps) {
    const filtered = pcaps.filter(pcap => pcap.id === id);
    return filtered.length > 0 ? filtered[0] : null;
}

function getTotalValidStreams(pcap) {
    return pcap.video_streams + pcap.audio_streams + pcap.anc_streams;
}

function isAnyStreamIsValid(pcap) {
    return getTotalValidStreams(pcap) > 0;
}

function getStatusForPcapInfo(pcap) {
    if (pcap.progress && pcap.progress < 100) {
        return {
            state: pcapEnums.state.processing,
            progress: pcap.progress,
            stateLabel: pcap.stateLabel
        };
    }

    if (pcap.error) {
        return {
            state: pcapEnums.state.failed
        };

    }

    if (!pcap.analyzed || !isAnyStreamIsValid(pcap)) {
        return {
            state: pcapEnums.state.needs_user_input
        };

    }

    if (pcap.total_streams === 0) {
        return {
            state: pcapEnums.state.no_analysis
        };
    }

    if (pcap.summary === undefined) {
        // TODO: this is to deal with legacy
        return {
            state: pcapEnums.state.no_analysis
        };
    }

    if (pcap.summary.error_list.length > 0) {
        return {
            state: pcapEnums.state.not_compliant
        };
    }

    return {
        state: pcapEnums.state.compliant
    };
}

function getPtpStateForPcapInfo(pcap) {
    return (pcap.offset_from_ptp_clock !== 0); // Todo: add an alternative way of getting this information
}

function addStateToPcapInfo(pcap) {
    return {
        ...pcap,
        status: getStatusForPcapInfo(pcap),
        ptp: getPtpStateForPcapInfo(pcap),
    };
}

class PcapList extends Component {
    constructor(props) {
        super(props);

        this.toggleRow = this.toggleRow.bind(this);

        this.state = {
            data: this.props.pcaps.map(addStateToPcapInfo),
            selected: [],
            selectAll: 0,
            deleteModalData: null
        };

        this.toggleRow = this.toggleRow.bind(this);
        this.toggleSelectAll = this.toggleSelectAll.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.deletePcaps = this.deletePcaps.bind(this);
        this.onPcapClick = this.onPcapClick.bind(this);
        this.onPcapReceived = this.onPcapReceived.bind(this);
        this.onPcapProcessed = this.onPcapProcessed.bind(this);
        this.onPcapFailed = this.onPcapFailed.bind(this);
        this.onDone = this.onDone.bind(this);
        this.onSelectBefore = this.onSelectBefore.bind(this);
        this.onSelectAfter = this.onSelectAfter.bind(this);
        this.onDownloadPcaps = this.onDownloadPcaps.bind(this);
        this.onDownloadSdps = this.onDownloadSdps.bind(this);
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

    toggleRow(id) {
        const newSelected = this.state.selected.filter(item => item !== id);

        if (newSelected.length === this.state.selected.length) {
            newSelected.push(id);
        }

        this.setState({
            selected: newSelected,
            selectAll: 2
        });
    }

    toggleSelectAll() {
        let newSelected = [];

        if (this.state.selectAll === 0) {
            newSelected = this.state.data.map(item => item.id);
        }

        this.setState({
            selected: newSelected,
            selectAll: this.state.selectAll === 0 ? 1 : 0
        });
    }

    onPcapClick(pcapId) {
        const route = routeBuilder.pcap_stream_list(pcapId);
        window.appHistory.push(route);
    }

    onDelete() {
        const idsToDelete = this.state.selected;
        this.setState({ deleteModalData: idsToDelete });
    }

    deletePcaps(idsToDelete) {
        this.setState({
            deleteModalData: null,
            selected: [],
            selectAll: 0
        });

        // TODO: refactor this to delete all with a single call
        idsToDelete.forEach(id => this.deletePcap(id));
    }

    deletePcap(id) {
        const pcap = getFullInfoFromId(id, this.state.data);
        const filename = pcap && pcap.file_name;

        api.deletePcap(id)
            .then(() => {
                const newData = immutable.findAndRemoveElementInArray({ id }, this.state.data);

                this.setState({ data: newData });

                notifications.success({
                    title: translate('notifications.success.pcap_deleted'),
                    message: translate('notifications.success.pcap_deleted_message', { name: filename })
                });
            })
            .catch(() => {
                notifications.error({
                    title: translate('notifications.error.pcap_deleted'),
                    message: translate('notifications.error.pcap_deleted_message', { name: filename })
                });
            });
    }

    onPcapReceived(newPcap) {
        const info = addStateToPcapInfo(newPcap);
        info.stateLabel = translate('workflow.reading_pcap');

        this.setState({
            data: [
                info,
                ...this.state.data
            ]
        });
    }

    updatePcap(pcap, newStateLabel) {
        const info = addStateToPcapInfo(pcap);
        info.stateLabel = translate(newStateLabel);

        const data = immutable.findAndUpdateElementInArray({ id: pcap.id }, this.state.data, info);

        this.setState({ data });
    }

    onPcapProcessed(pcap) {
        this.updatePcap(pcap, 'workflow.processing_streams');
    }

    onPcapFailed(pcap) {
        this.updatePcap(pcap, 'workflow.processing_streams');
    }

    onDone(pcap) {
        this.updatePcap(pcap, 'workflow.done');
    }

    onSelectBefore(id) {
        const pcap = getFullInfoFromId(id, this.state.data);
        const baseDate = pcap.date;
        const newSelected = this.state.data.filter(item => item.date <= baseDate).map(item => item.id);

        this.setState({
            selected: newSelected,
            selectAll: this.state.selectAll === 0 ? 1 : 0
        });
    }

    onSelectAfter(id) {
        const pcap = getFullInfoFromId(id, this.state.data);
        const baseDate = pcap.date;
        const newSelected = this.state.data.filter(item => item.date >= baseDate).map(item => item.id);

        this.setState({
            selected: newSelected,
            selectAll: this.state.selectAll === 0 ? 1 : 0
        });
    }

    onDownloadPcaps() {
        const filesForDownload = this.state.selected.map(id => api.downloadPcapUrl(id));
        downloadFiles(filesForDownload);
    }

    onDownloadSdps() {
        const filesForDownload = this.state.selected.map(id => api.downloadSDPUrl(id));
        downloadFiles(filesForDownload);
    }

    render() {
        const withData = (
            <div>
                <PcapActions
                    selectedItems={this.state.selected}
                    onDelete={this.onDelete}
                    onSelectAfter={this.onSelectAfter}
                    onSelectBefore={this.onSelectBefore}
                    onDownloadPcaps={this.onDownloadPcaps}
                    onDownloadSdps={this.onDownloadSdps}
                />
                <PcapTable
                    pcaps={this.state.data}
                    selectedIds={this.state.selected}
                    selectAll={this.state.selectAll}
                    onSelectId={this.toggleRow}
                    onSelectAll={this.toggleSelectAll}
                    onClickRow={this.onPcapClick}
                    noDataComponent={this.props.noDataComponent}
                />
            </div>
        );

        return (
            <div>
                <DeleteModal data={this.state.deleteModalData} onAction={this.deletePcaps} />
                {withData}
            </div>
        );
    }
}

export default asyncLoader(PcapList, {
    asyncRequests: {
        pcaps: () => api.getPcaps()
    }
});
