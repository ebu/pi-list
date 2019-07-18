import React from 'react';

const isSelected = (id, all) => {
    return all.some(item => item === id);
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

export {
    isSelected,
    getGetTdProps,
    getCheckBoxColumn
}
