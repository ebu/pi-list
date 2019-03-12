import React from 'react';
import PropTypes from 'prop-types';
import Button from 'components/common/Button';

const PcapActions = props => {

    const deleteButton = (
        <Button
            className="lst-table-delete-item-btn"
            icon="delete"
            type="danger"
            link
            disabled={props.selectedItems === null || props.selectedItems.length === 0}
            onClick={(evt) => {
                evt.stopPropagation();
                props.onDelete();
            }}
        />
    );

    const selectBefore = (
        <Button
            className="lst-table-delete-item-btn"
            icon="navigate_before"
            type="info"
            link
            disabled={props.selectedItems === null || props.selectedItems.length !== 1}
            onClick={(evt) => {
                evt.stopPropagation();
                props.onSelectBefore(props.selectedItems[0]);
            }}
        />
    );

    const selectAfter = (
        <Button
            className="lst-table-delete-item-btn"
            icon="navigate_next"
            type="info"
            link
            disabled={props.selectedItems === null || props.selectedItems.length !== 1}
            onClick={(evt) => {
                evt.stopPropagation();
                props.onSelectAfter(props.selectedItems[0]);
            }}
        />
    );

    return (
        <div className="lst-table-actions">
            { deleteButton }
            { selectBefore }
            { selectAfter }
        </div>
    );
}

PcapActions.propTypes = {
    selectedItems: PropTypes.array,
    onDelete: PropTypes.func,
    onSelectBefore: PropTypes.func,
    onSelectAfter: PropTypes.func,
};

PcapActions.defaultProps = {
    selectedItems: [],
    onDelete: () => { },
    onSelectBefore: () => { },
    onSelectAfter: () => { },
};

export default PcapActions;
