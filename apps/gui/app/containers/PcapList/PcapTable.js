import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import _ from 'lodash';
import ReactTable from "react-table";
import "react-table/react-table.css";
import Icon from '../../components/common/Icon';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import { translateX } from '../../utils/translation';
import pcapEnums from '../../enums/pcap';
import Tooltip from '../../components/common/Tooltip';
import { isSelected, getGetTdProps, getCheckBoxColumn } from '../../components/table/utils';


const getWEMessage = item => {
    const id = _.get(item, ['value', 'id'], null);
    return translateX('analysis.' + id);
}


const statusSortMethod = (a, b, desc) => {
    // force null and undefined to the bottom
    a = a === null || a === undefined ? { state: '' } : a;
    b = b === null || b === undefined ? { state: '' } : b;

    // Return either 1 or -1 to indicate a sort priority
    if (a.state > b.state) {
        return 1;
    }
    if (a.state < b.state) {
        return -1;
    }

    // returning 0 or undefined will use any subsequent column sorting methods or the row index as a tiebreaker
    return 0;
};

function renderPcapFileName({ original }) {
    const data = original;

    return data.generated_from_network ?
        <Fragment>
            <Icon value="input" className="lst-table-small-icon" />
            {data.file_name}
        </Fragment> : data.file_name;
}

function renderPcapDate({ original }) {
    return (
        <div className="lst-text-center">
            {moment(original.date).format('YYYY-MM-DD HH:mm:ss')}
        </div>
    );
}

function renderStatus({ value }) {
    if (value.state === pcapEnums.state.processing) {
        return (
            <Fragment>
                <div className="row lst-text-blue middle-xs lst-no-margin">
                    <Icon value="autorenew" className="spin" />
                    <span>{value.stateLabel}</span>
                </div>
                <ProgressBar percentage={value.progress} />
            </Fragment>
        );
    }

    return renderPcapStatusCell(value.state);
}

function getStateIcon(state) {
    if (state === pcapEnums.state.failed) {
        return 'close';
    } else if (state === pcapEnums.state.needs_user_input) {
        return 'warning';
    } else if (state === pcapEnums.state.no_analysis) {
        return 'info';
    } else if (state === pcapEnums.state.not_compliant) {
        return 'close';
    } else {
        if (state !== pcapEnums.state.compliant) { throw new Error(`unexpected state ${state}`); };
        return 'done all';
    }
}

function getStateType(state) {
    if (state === pcapEnums.state.failed) {
        return 'danger';
    } else if (state === pcapEnums.state.needs_user_input) {
        return 'warning';
    } else if (state === pcapEnums.state.no_analysis) {
        return 'info';
    } else if (state === pcapEnums.state.not_compliant) {
        return 'danger';
    } else {
        if (state !== pcapEnums.state.compliant) { throw new Error(`unexpected state ${state}`); };
        return 'success';
    }
}

function renderPcapStatusCell(state) {
    return (
        <Fragment>
            <Badge
                className="lst-table-configure-sdp-badge"
                type={getStateType(state)}
                text=""
                icon={getStateIcon(state)}
            />
            <span>{translateX(state)}</span>
        </Fragment>
    );
}

function renderWE(value, className) {
    if (!value || value.length === 0) {
        return (<span />);
    }

    const tooltipMessage = (<span>{value.map((w, index) => {
        return (<p key={index}>{getWEMessage(w)}</p>);
    })}</span>);

    const content = (<span className="lst-color-warning">{value.length}</span>);

    return (
        <span className="lst-text-center">
        <Tooltip message={tooltipMessage} position={'top'}>{content}</Tooltip>
        </span>
    );
}

function renderErrors({ value }) {
    return renderWE(value, 'lst-white-on-red');
}

function renderWarnings({ value }) {
    return renderWE(value, 'lst-color-warning');
}

function renderPtp({ value }) {
    if (value) {
        return (<Icon className="lst-color-ok" value="check" />);
    }

    return (<span />);
}

const getNumberUnknownStreams = (info) =>
    (info.total_streams - info.video_streams - info.audio_streams - info.anc_streams);

const PcapTable = props => {
    const columns = [
        getCheckBoxColumn(props),
        {
            Header: translateX('pcap.file_name'),
            headerClassName: 'lst-text-left lst-table-header',
            accessor: 'file_name',
            className: 'lst-text-left',
            Cell: renderPcapFileName
        },
        {
            Header: '',
            accessor: 'status',
            className: 'lst-text-left',
            Cell: renderStatus,
            maxWidth: 180,
            sortMethod: statusSortMethod
        },
        {
            Header: (<span title={translateX('pcap.errors')}><Icon value="close" /></span>),
            headerClassName: 'lst-text-center lst-table-header',
            accessor: 'summary.error_list',
            Cell: renderErrors,
            className: 'lst-overflow-visible',
            minWidth: 50,
            maxWidth: 50,
        },
        {
            Header: (<span title={translateX('pcap.warnings')}><Icon value="warning" /></span>),
            headerClassName: 'lst-text-center lst-table-header',
            accessor: 'summary.warning_list',
            Cell: renderWarnings,
            className: 'lst-overflow-visible',
            minWidth: 50,
            maxWidth: 50,
        },
        {
            Header: (<Icon value="videocam" />),
            headerClassName: 'lst-text-center lst-table-header',
            accessor: 'video_streams',
            minWidth: 50,
            maxWidth: 50,
        },
        {
            Header: (<Icon value="audiotrack" />),
            headerClassName: 'lst-text-center lst-table-header',
            accessor: 'audio_streams',
            minWidth: 50,
            maxWidth: 50,
        },
        {
            Header: (<Icon value="assignment" />),
            headerClassName: 'lst-text-center lst-table-header',
            accessor: 'anc_streams',
            minWidth: 50,
            maxWidth: 50,
        },
        {
            id: 'unknwon_streams',
            Header: (<Icon value="help" />),
            headerClassName: 'lst-text-center lst-table-header',
            accessor: info => getNumberUnknownStreams(info),
            minWidth: 50,
            maxWidth: 50,
        },
        {
            Header: (<Icon value="timer" />),
            headerClassName: 'lst-text-center lst-table-header',
            accessor: 'ptp',
            Cell: renderPtp,
            minWidth: 50,
            maxWidth: 50,
        },
        {
            Header: translateX('date'),
            headerClassName: 'lst-text-center lst-table-header',
            accessor: 'date',
            Cell: renderPcapDate,
            width: 180,
        },
    ];

    return (
        <ReactTable
            data={props.pcaps}
            columns={columns}
            defaultPageSize={10}
            className="-highlight lst-text-center"
            getTdProps={getGetTdProps(props)}
            defaultSorted={[{
                id: 'date',
                desc: true,
            }]}
            NoDataComponent={props.noDataComponent}
        />
    );
}

PcapTable.propTypes = {
    pcaps: PropTypes.arrayOf(PropTypes.any),
    selectedIds: PropTypes.arrayOf(PropTypes.string),
    selectAll: PropTypes.number,
    onSelectId: PropTypes.func,
    onSelectAll: PropTypes.func,
    onClickRow: PropTypes.func,
    noDataComponent: PropTypes.func
};

PcapTable.defaultProps = {
    pcaps: [],
    selectedIds: [],
    selectAll: 0,
    onSelectId: () => { },
    onSelectAll: () => { },
    onClickRow: () => { },
    noDataComponent: () => null
};

export default PcapTable;
