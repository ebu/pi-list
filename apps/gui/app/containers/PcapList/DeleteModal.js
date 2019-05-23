import React from 'react';
import 'react-table/react-table.css';
import PropTypes from 'prop-types';
import PopUp from '../../components/common/PopUp';
import { translate, translateX } from '../../utils/translation';

const DeleteModal = (props) => (
    <PopUp
        type="delete"
        visible={props.data !== null && props.data.length > 0}
        label={translateX('pcap.delete_header')}
        message={translateX('pcap.delete_message', { name: props.data ? props.data.length : 0 })}
        onClose={() => props.onAction([])}
        onDelete={() => props.onAction(props.data)}
    />
);

DeleteModal.propTypes = {
    data: PropTypes.arrayOf(PropTypes.string),
    onAction: PropTypes.func
};

DeleteModal.defaultProps = {
    data: [],
    onAction: () => { },
};

export default DeleteModal;
