import React from 'react';
import PropTypes from 'prop-types';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import { translateX } from '../../utils/translation';
import { getTablePageSize, onTableSizeChange } from '../../components/table/utils';

import api from '../../utils/api';
import notifications from '../../utils/notifications';
import Button from '../../components/common/Button';

const onFileDownload = (fileItem) => {
    api.downloadFile(fileItem._id)
        .then(({ data }) => {
            const downloadUrl = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', fileItem.name);
            document.body.appendChild(link);
            link.click();
            link.remove();
        })
        .catch(e => notifications.error({ messageTag: e }));
};

function renderButton(rowItem) {
    return (
        <Button
            key={rowItem.row._original._id}
            type="primary"
            label={translateX('dmngr.download')}
            outline
            noMargin
            noAnimation
            onClick={() => onFileDownload(rowItem.row._original)}
        />
    );
}

const DownloadMngrTable = props => {
    const columns = [
        {
            Header: translateX('dmngr.name'),
            headerClassName: 'lst-text-left lst-table-header',
            accessor: 'name',
            className: 'lst-text-left',
            width: 390,
        },
        {
            Header: translateX('dmngr.availableon'),
            headerClassName: 'lst-text-left lst-table-header',
            accessor: 'availableonfancy',
            className: 'lst-text-left',
        },
        {
            Header: translateX('dmngr.availableuntil'),
            headerClassName: 'lst-text-left lst-table-header',
            accessor: 'availableuntilfancy',
            className: 'lst-text-left',
        },
        {
            headerClassName: 'lst-text-left lst-table-header',
            accessor: '_id',
            className: '',
            Cell: renderButton,
        },
    ];

    return (
        <ReactTable
            previousText={translateX('table.previous')}
            nextText={translateX('table.next')}
            data={props.data}
            columns={columns}
            defaultPageSize={getTablePageSize('download')}
            onPageSizeChange={onTableSizeChange('download')}
            className="-highlight lst-text-center"
            defaultSorted={[
                {
                    id: 'availableon',
                    desc: true,
                },
            ]}
            NoDataComponent={props.noDataComponent}
        />
    );
};

DownloadMngrTable.propTypes = {
    data: PropTypes.arrayOf(PropTypes.any),
    noDataComponent: PropTypes.func,
};

DownloadMngrTable.defaultProps = {
    data: [],
    noDataComponent: () => null,
};

export default DownloadMngrTable;
