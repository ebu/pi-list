import React, { Component, Fragment } from 'react';
import moment from 'moment';
import Icon from 'components/common/Icon';
import Badge from 'components/common/Badge';
import ProgressBar from 'components/common/ProgressBar';
import { translate } from 'utils/translation';
import ReactTable from "react-table";
import "react-table/react-table.css";
import PropTypes from 'prop-types';
import pcapEnums from '../../enums/pcap';

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
            {data.file_name}
            <Badge
                className="lst-table-configure-sdp-badge"
                type="info"
                icon="settings_input_composite"
            />
        </Fragment> : data.file_name;
}

function renderPcapDate({ original }) {
    return (
        <div className="lst-text-center">
            {moment(original.date).format('YYYY-MM-DD hh:mm:ss')}
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
            <span>{translate(state)}</span>
        </Fragment>
    );
}

function renderWarnings({ value }) {
    if (value.length === 0) {
        return (<span />);
    }

    return (
        <span className="lst-text-center" title={translate('pcap.truncated')}>
            <Badge
                className="lst-table-configure-sdp-badge"
                type="warning2"
                icon="warning"
                text=""
            />
        </span>
    );
}

function renderPtp({ value }) {
    if (value) {
        return (
            <div className="lst-text-center">
                <Badge
                    className="lst-table-configure-sdp-badge"
                    type="success2"
                    icon="timer"
                    text=""
                />
            </div>
        );
    }

    return (<span />);
}

function renderStreamCount({ original }) {
    if (!original.analyzed) {
        return (<span></span>);
    }

    return (
        <div className="lst-text-center">
            <span className="stream-type-number">
                <Icon value="videocam" /> {original.video_streams}
            </span>
            <span className="stream-type-number">
                <Icon value="audiotrack" /> {original.audio_streams}
            </span>
            <span className="stream-type-number">
                <Icon value="assignment" /> {original.anc_streams}
            </span>
            <span className="stream-type-number">
                <Icon value="help" /> {original.total_streams - original.video_streams - original.audio_streams - original.anc_streams}
            </span>

        </div>
    );
}

const isSelected = (id, all) => {
    return all.some(item => item === id);
}

const PcapTable = props => {
    const columns = [
        {
            id: "checkbox",
            accessor: "",
            Cell: ({ original }) => {
                return (
                    <div className="lst-text-center">
                        <input
                            type="checkbox"
                            className="checkbox"
                            checked={isSelected(original.id, props.selectedIds)}
                            onChange={() => props.onSelectId(original.id)}
                        />
                    </div>
                );
            },
            Header: x => {
                return (
                    <input
                        type="checkbox"
                        className="checkbox"
                        checked={props.selectAll === 1}
                        ref={input => {
                            if (input) {
                                input.indeterminate = props.selectAll === 2;
                            }
                        }}
                        onChange={() => props.onSelectAll()}
                    />
                );
            },
            sortable: false,
            width: 45
        },
        {
            Header: translate('pcap.file_name'),
            headerClassName: 'lst-text-left lst-table-header',
            accessor: 'file_name',
            Cell: renderPcapFileName
        },
        {
            Header: '',
            accessor: 'status',
            Cell: renderStatus,
            maxWidth: 180,
            sortMethod: statusSortMethod
        },
        {
            Header: '',
            accessor: 'all',
            Cell: renderStreamCount,
            maxWidth: 150,
            sortable: false,
        },
        {
            Header: 'PTP',
            headerClassName: 'lst-text-center lst-table-header',
            accessor: 'ptp',
            Cell: renderPtp,
            minWidth: 50,
            maxWidth: 50,
        },
        {
            Header: (<span title={translate('pcap.warnings')}>!</span>),
            headerClassName: 'lst-text-center lst-table-header',
            accessor: 'warnings',
            Cell: renderWarnings,
            minWidth: 50,
            maxWidth: 50,
        },
        {
            Header: translate('date'),
            headerClassName: 'lst-text-center lst-table-header',
            accessor: 'date',
            Cell: renderPcapDate,
            width: 180,
        },
    ];

    const getTdProps = (state, rowInfo, column, instance) => {
        return {
            onClick: (e, handleOriginal) => {
                if (column.id === 'checkbox') {
                    return;
                }

                props.onClickRow(rowInfo.original.id);

                if (handleOriginal) {
                    handleOriginal();
                }
            }
        };
    };

    return (
        <ReactTable
            data={props.pcaps}
            columns={columns}
            defaultPageSize={10}
            className="-highlight"
            getTdProps={getTdProps}
            defaultSorted={[{
                id: 'date',
                desc: true,
            }]}
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
};

PcapTable.defaultProps = {
    pcaps: [],
    selectedIds: [],
    selectAll: 0,
    onSelectId: () => { },
    onSelectAll: () => { },
    onClickRow: () => { },
};

export default PcapTable;
