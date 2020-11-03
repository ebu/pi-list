import React from 'react';
import Icon from '../../components/common/Icon';

const isSelected = (id, all) => {
    return all.some(item => item === id);
}

const getGetTableProps = (props) => (state, dum1, dum2, instance) => {
    if (state.pageRows) {
        props.getVisible(state.pageRows);
    }
    return { onClick: (e, handleOriginal) => { } };
}

const getGetTdProps = (props) => (state, rowInfo, column, instance) => {

    return {
        onClick: (e, handleOriginal) => {
            if (column.id === 'checkbox') {
                return;
            }

            if (rowInfo && rowInfo.original) {
                props.onClickRow(rowInfo.original.id);
            }

            if (handleOriginal) {
                handleOriginal();
            }
        }
    };
};

const getKindColumn = sources => ({
    Header: '',
    headerClassName: 'lst-text-left lst-table-header',
    accessor: 'kind',
    className: 'lst-text-center',
    Cell: ({ original }) => {
        switch (original.kind) {
            case sources.kinds.user_defined:
                return <Icon value={'person'} />;

            case sources.kinds.from_sdp:
                if (original.sdp.errors.length > 0) {
                    return (
                        <div>
                            <span
                                title={original.sdp.errors}
                                style={{ color: 'red', display: 'flex' }}>
                                <Icon value={'priority_high'} />
                                SDP
                            </span>
                        </div>
                    );
                } else {
                    return <span style={{ color: 'green' }}>SDP</span>;
                }

            case sources.kinds.nmos:
                return (
                    <img src="/static/nmos.png" alt="NMOS logo" width="45px" />
                );

            default:
                return '';
        }
    },
    width: 60,
});

const getCheckBoxColumn = (props) => (
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
    }
);

const getTablePageSize = (key) => {
    const size = localStorage.getItem('table-page-size-' + key);
    return Number(size) == 0 ? 5 : Number(size);
}

const setTablePageSize = (key, value) => {
    localStorage.setItem('table-page-size-' + key, value);
}

const onTableSizeChange = (type) => (pageSize, pageIndex) => {
    setTablePageSize(type, pageSize)
}

export {
    isSelected,
    getGetTableProps,
    getGetTdProps,
    getKindColumn,
    getCheckBoxColumn,
    getTablePageSize,
    onTableSizeChange,
}
