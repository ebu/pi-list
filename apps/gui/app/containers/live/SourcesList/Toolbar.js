import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import Button from '../../../components/common/Button';
import actions from '../../../utils/models/table/actions';

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

    return (
        <div className="lst-table-actions">
            {deleteButton}
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
