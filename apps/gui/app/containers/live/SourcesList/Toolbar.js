import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import FormInput from '../../../components/common/FormInput';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Icon from '../../../components/common/Icon';
import actions from '../../../utils/models/table/actions';
import Actions from './Actions';
import './Toolbar.scss';

const Toolbar = props => {
    const deleteButton = (
        <Button
            icon="delete"
            type="danger"
            link
            disabled={
                props.selectedItems === null || props.selectedItems.length === 0
            }
            onClick={() =>
                props.dispatch({
                    type: actions.requestDelete,
                    data: { ids: props.selectedItems },
                })
            }
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

    const colSizes = { labelColSize: 1, valueColSize: 11 };
    const searchBar = (
        <div className="lst-toolbar-search">
            <FormInput icon="search" {...colSizes}>
                <Input
                    className="lst-toolbar-search-input"
                    type="text"
                    value={props.searchString}
                    onChange={evt =>
                        props.dispatch({
                            type: Actions.setSearchString,
                            payload: { value: evt.currentTarget.value },
                        })
                    }
                />
            </FormInput>
            <button
                onClick={() =>
                    props.dispatch({
                        type: Actions.setSearchString,
                        payload: { value: null },
                    })
                }
            >
                <Icon value="cancel" />
            </button>
        </div>
    );

    return (
        <div className="lst-table-actions">
            {deleteButton}
            {addSourceButton}
            {searchBar}
        </div>
    );
};

Toolbar.propTypes = {
    dispatch: PropTypes.func.isRequired,
    selectedItems: PropTypes.array.isRequired,
    searchString: PropTypes.string,
};

Toolbar.defaultProps = {
    searchString: '',
};

export default Toolbar;
