import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import Button from '../../../components/common/Button';
import actions from '../../../utils/models/table/actions';
import Actions from './Actions';

const Toolbar = props => {

    const deleteButton = (
        <Button
            icon="delete"
            type="danger"
            link
            disabled={props.selectedItems === null || props.selectedItems.length === 0}
            onClick={() => props.dispatch({ type: actions.requestDelete, data: { ids: props.selectedItems } })}
        />
    );

    const captureButton = (
        <Button
            icon="fiber_manual_record"
            type="info"
            link
            disabled={props.selectedItems === null || props.selectedItems.length === 0}
            onClick={() => props.dispatch({ type: Actions.captureFromSources, payload: { ids: props.selectedItems } })}
        />
    );

    const addSourceButton = (
        <Button
            icon="add"
            type="info"
            link
            onClick={() => props.dispatch({ type: Actions.showAddSource })}
        />
    );

    return (
        <div className="lst-table-actions">
            {deleteButton}
            {captureButton}
            {addSourceButton}
        </div>
    );
}

Toolbar.propTypes = {
    dispatch: PropTypes.func.isRequired,
    selectedItems: PropTypes.array.isRequired,
};

Toolbar.defaultProps = {
};

export default Toolbar;
