import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import Button from '../../../components/common/Button';
import actions from '../../../utils/models/table/actions';
import Actions from './Actions';

const Toolbar = props => {
    return (
        <div className="lst-table-actions">
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
