import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import sources from 'ebu_list_common/capture/sources';
import { translateX } from '../../../utils/translation';
import Icon from '../../../components/common/Icon';
import { getTablePageSize, onTableSizeChange } from '../../../components/table/utils';

import {
    getGetTdProps,
    getGetTableProps,
    getKindColumn,
    getCheckBoxColumn,
} from '../../../components/table/utils';

const SourcesTable = props => {
    const columns = [
        getCheckBoxColumn(props),
        {
            Header: translateX('live.sources.name'),
            headerClassName: 'lst-text-left lst-table-header',
            accessor: 'meta.label',
            className: 'lst-text-left',
        },
        getKindColumn(sources, props),
        {
            Header: translateX('live.sources.destination_address'),
            headerClassName: 'lst-text-left lst-table-header',
            accessor: 'meta.network.destination',
            className: 'lst-text-left',
            width: 200,
        },
        {
            Header: '',
            headerClassName: 'lst-text-left lst-table-header',
            accessor: 'meta.format',
            className: 'lst-text-left',
            Cell: renderIcon,
            width: 40,
        },
        {
            Header: translateX('live.sources.format'),
            headerClassName: 'lst-text-left lst-table-header',
            accessor: 'media_specific.resolution',
            className: 'lst-text-left',
        },
    ];

    return (
        <ReactTable
            previousText={translateX('table.previous')}
            nextText={translateX('table.next')}
            data={props.data}
            columns={columns}
            defaultPageSize={getTablePageSize('source')}
            onPageSizeChange={onTableSizeChange('source')}
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

SourcesTable.propTypes = {
    data: PropTypes.arrayOf(PropTypes.any),
    selectedIds: PropTypes.arrayOf(PropTypes.string),
    selectAll: PropTypes.number,
    onSelectId: PropTypes.func,
    onSelectAll: PropTypes.func,
    onClickRow: PropTypes.func,
    getVisible: PropTypes.func,
    noDataComponent: PropTypes.func,
};

SourcesTable.defaultProps = {
    data: [],
    selectedIds: [],
    selectAll: 0,
    onSelectId: () => {},
    onSelectAll: () => {},
    onClickRow: () => {},
    getVisible: () => {},
    noDataComponent: () => null,
};

export default SourcesTable;
