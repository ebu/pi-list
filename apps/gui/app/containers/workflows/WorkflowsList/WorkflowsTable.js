import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import sources from 'ebu_list_common/capture/sources';
import wfSchema from 'ebu_list_common/workflows/schema';
import Icon from '../../../components/common/Icon';
import Badge from '../../../components/common/Badge';
import { T, translateX } from '../../../utils/translation';
import {
    getGetTdProps,
    getGetTableProps,
    getCheckBoxColumn,
    getTablePageSize,
    onTableSizeChange,
} from '../../../components/table/utils';

function renderDate({ original }) {
    const created = _.get(original, ['meta', 'times', 'created']);
    return created ? (
        <div className="lst-text-center">
            {moment(created).format('YYYY-MM-DD HH:mm:ss')}
        </div>
    ) : (
            '---'
        );
}

function getStatusIcon(state) {
    if (state === wfSchema.status.requested) {
        return 'pause';
    } else if (state === wfSchema.status.started) {
        return 'play arrow';
    } else if (state === wfSchema.status.completed) {
        return 'stop';
    } else if (state === wfSchema.status.canceled) {
        return 'not_interested';
    } else {
        if (state !== wfSchema.status.failed) {
            throw new Error(`unexpected state ${state}`);
        }
        return 'close';
    }
}

function getStatusType(state) {
    if (state === wfSchema.status.requested) {
        return 'warning';
    } else if (state === wfSchema.status.started) {
        return 'success';
    } else if (state === wfSchema.status.completed) {
        return 'passive';
    } else if (state === wfSchema.status.canceled) {
        return 'warning2';
    } else {
        if (state !== wfSchema.status.failed) {
            throw new Error(`unexpected state ${state}`);
        }
        return 'danger';
    }
}

function renderpercentage( {value} ) {
    return <span>{value.percentage} %</span>
}

function renderStatus({ value }) {
    return (
        <Fragment>
            <Badge
                className="lst-table-configure-sdp-badge"
                type={getStatusType(value)}
                text=""
                icon={getStatusIcon(value)}
            />
        </Fragment>
    );
}

function renderLabel({ value }) {
    const name = `workflow.names.${value}`;
    return <T t={name} />;
}

function renderMessage({ value }) {
    if (value.status === wfSchema.status.failed) {
        if(typeof(value.errorMessage) == "string") {
            return <span>{value.errorMessage}</span>;
        }
        return <span>{value.errorMessage.message ? value.errorMessage.message : value.errorMessage.toString()}</span>;
    }
    return <span />;
}

const WorkflowsTable = props => {
    console.log(props);
    const columns = [
        getCheckBoxColumn(props),
        // accessors come from props.data[]
        {
            Header: '',
            headerClassName: 'lst-text-left lst-table-header',
            accessor: 'type',
            className: '',
            Cell: renderLabel,
            minWidth: 190,
            maxWidth: 190,
        },
        {
            Header: '',
            headerClassName: 'lst-text-left lst-table-header',
            accessor: 'state.status',
            Cell: renderStatus,
            minWidth: 60,
            maxWidth: 60,
        },
        {
            Header: '',
            headerClassName: 'lst-text-left lst-table-header',
            accessor: 'state',
            Cell: renderpercentage,
            minWidth: 60,
            maxWidth: 60,
        },
        {
            Header: '',
            headerClassName: 'lst-text-left lst-table-header',
            accessor: 'state',
            className: '',
            Cell: renderMessage,
        },
        {
            Header: '',
            headerClassName: 'lst-text-left lst-table-header',
            accessor: 'meta.times.created',
            className: '',
            Cell: renderDate,
        },
    ];

    return (
        <ReactTable
            previousText={translateX('table.previous')}
            nextText={translateX('table.next')}
            data={props.data}
            columns={columns}
            defaultPageSize={getTablePageSize('workflow')}
            onPageSizeChange={onTableSizeChange('workflow')}
            className="-highlight lst-text-center"
            getTdProps={getGetTdProps(props)}
            getTableProps={getGetTableProps(props)}
            defaultSorted={[
                {
                    id: 'date',
                    desc: true,
                },
            ]}
            NoDataComponent={props.noDataComponent}
        />
    );
};

const getIconValue = value => {
    switch (value) {
        case 'urn:x-nmos:format:video':
            return 'videocam';
        case 'urn:x-nmos:format:audio':
            return 'audiotrack';
        case 'urn:x-nmos:format:data':
            return 'description';

        default:
            return 'help';
    }
};

const renderIcon = ({ value }) => {
    return (
        <span className="stream-type-number">
            <Icon value={getIconValue(value)} />
        </span>
    );
};

const renderKind = ({ value }) => {
    switch (value) {
        case sources.kinds.user_defined:
            return <Icon value={'person'} />;

            case sources.kinds.from_sdp:
                return <span>SDP</span>;
    
            case sources.kinds.nmos:
                return <img src="/static/nmos.png" alt="NMOS logo" width="45px" />;
    
        default:
            return '';
    }
};

WorkflowsTable.propTypes = {
    data: PropTypes.arrayOf(PropTypes.any),
    selectedIds: PropTypes.arrayOf(PropTypes.string),
    selectAll: PropTypes.number,
    onSelectId: PropTypes.func,
    onSelectAll: PropTypes.func,
    onClickRow: PropTypes.func,
    noDataComponent: PropTypes.func,
};

WorkflowsTable.defaultProps = {
    data: [],
    selectedIds: [],
    selectAll: 0,
    onSelectId: () => { },
    onSelectAll: () => { },
    onClickRow: () => { },
    noDataComponent: () => null,
};

export default WorkflowsTable;
