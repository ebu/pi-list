import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import Icon from '../../../components/common/Icon';
import { translateX } from '../../../utils/translation';
import { getGetTdProps, getCheckBoxColumn } from '../../../components/table/utils';

const renderLabel = ({ value }) => {
    return <span>{value}</span>;
};

const renderDelay = ({ value }) => {
    return <span> {(value / 1000).toFixed(3)} </span>;
};

const getIconValue = value => {
    switch (value) {
        case 'video':
            return 'videocam';
        case 'audio':
            return 'audiotrack';
        case 'ancillary':
            return 'subtitles';
        case true:
            return 'done';
        case false:
            return 'clear';
        default:
            return 'help';
    }
};

const renderIcon = ({ value }) => {
    return (
        <span>
            <Icon value={getIconValue(value)} />
        </span>
    );
};

const renderDate = ({ value }) => {
    return <div className="lst-text-center">{moment(value).format('YYYY-MM-DD HH:mm:ss')}</div>;
};

const ComparisonsTable = props => {
    const columns = [
        getCheckBoxColumn(props),
        // accessors come from props.data[]
        {
            Header: translateX('name'),
            headerClassName: 'lst-text-left lst-table-header',
            accessor: 'name',
            className: '',
            Cell: renderLabel,
            minWidth: 200,
            maxWidth: 200,
        },
        {
            Header: translateX('comparison.type'),
            headerClassName: 'lst-text-left lst-table-header',
            accessor: 'type',
            className: '',
            Cell: renderLabel,
            minWidth: 200,
            maxWidth: 200,
        },
        {
            Header: translateX('comparison.config.reference'),
            headerClassName: 'lst-text-left lst-table-header',
            accessor: 'config.reference.media_type',
            className: '',
            Cell: renderIcon,
            minWidth: 100,
            maxWidth: 100,
        },
        {
            Header: translateX('comparison.config.main'),
            headerClassName: 'lst-text-left lst-table-header',
            accessor: 'config.main.media_type',
            className: '',
            Cell: renderIcon,
            minWidth: 100,
            maxWidth: 100,
        },
        {
            Header: translateX('comparison.result.transparency'),
            headerClassName: 'lst-text-left lst-table-header',
            accessor: 'result.transparency',
            className: '',
            Cell: renderIcon,
            minWidth: 100,
            maxWidth: 100,
        },
        {
            Header: `${translateX('comparison.result.delay')} (ms)`,
            headerClassName: 'lst-text-left lst-table-header',
            accessor: 'result.delay.actual',
            className: '',
            Cell: renderDelay,
            minWidth: 100,
            maxWidth: 100,
        },
        {
            Header: translateX('date'),
            headerClassName: 'lst-text-center lst-table-header',
            accessor: 'date',
            Cell: renderDate,
            width: 200,
        },
    ];

    return (
        <ReactTable
            previousText={translateX('table.previous')}
            nextText={translateX('table.next')}
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

ComparisonsTable.propTypes = {
    data: PropTypes.arrayOf(PropTypes.any),
    selectedIds: PropTypes.arrayOf(PropTypes.string),
    selectAll: PropTypes.number,
    onSelectId: PropTypes.func,
    onSelectAll: PropTypes.func,
    onClickRow: PropTypes.func,
    noDataComponent: PropTypes.func,
};

ComparisonsTable.defaultProps = {
    data: [],
    selectedIds: [],
    selectAll: 0,
    onSelectId: () => {},
    onSelectAll: () => {},
    onClickRow: () => {},
    noDataComponent: () => null,
};

export default ComparisonsTable;
