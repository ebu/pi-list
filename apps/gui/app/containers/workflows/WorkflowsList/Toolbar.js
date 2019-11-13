import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import Button from '../../../components/common/Button';

const Toolbar = props => {
    const deleteButton = (
        <Button
            icon="not_interested"
            type="danger"
            link
            disabled={
                props.selectedItems === null || props.selectedItems.length === 0
            }
            onClick={() => {
                props.cbFunction(props.selectedItems);

            }
        }
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
    cbFunction: PropTypes.func,
};

Toolbar.defaultProps = {
};

export default Toolbar;
