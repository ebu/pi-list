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
    getCheckBoxColumn,
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
    } else {
        if (state !== wfSchema.status.failed) {
            throw new Error(`unexpected state ${state}`);
        }
        return 'danger';
    }
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
        return <span>{value.errorMessage.toString()}</span>;
    }
    return <span />;
}

const WorkflowsTable = props => {
    const columns = [
        // getCheckBoxColumn(props),
        // {
        //     Header: translateX('live.sources.name'),
        //     headerClassName: 'lst-text-left lst-table-header',
        //     accessor: 'meta.label',
        //     className: 'lst-text-left',
        // },
        {
            Header: '',
            headerClassName: 'lst-text-left lst-table-header',
            accessor: 'type',
            className: '',
            Cell: renderLabel,
            minWidth: 150,
            maxWidth: 150,
        },
        {
            Header: '',
            headerClassName: 'lst-text-left lst-table-header',
            accessor: 'state.status',
            Cell: renderStatus,
            minWidth: 50,
            maxWidth: 50,
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
            data={props.data}
            columns={columns}
            defaultPageSize={10}
            className="-highlight lst-text-center"
            getTdProps={getGetTdProps(props)}
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
