import React from 'react';
import PropTypes from 'prop-types';
import PopUp from './common/PopUp';
import { translateX } from '../utils/translation';

const DeleteModal = (props) => (
    <PopUp
        type="delete"
        visible={props.data !== null && props.data.length > 0}
        label={translateX(props.label)}
        message={translateX(props.message, { name: props.data ? props.data.length : 0 })}
        onClose={() => props.onDelete([])}
        onDelete={() => props.onDelete(props.data)}
    />
);

DeleteModal.propTypes = {
    data: PropTypes.arrayOf(PropTypes.string),
    onAction: PropTypes.func,
    label: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
};

DeleteModal.defaultProps = {
    data: [],
    onDelete: () => { },
};

export default DeleteModal;
