import React from 'react';
import PropTypes from 'prop-types';
import Button from 'components/common/Button';

const PcapActions = props => {

    const deleteButton = (
        <Button
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

    const downloadPcap = (
        <Button
            className="lst-header-button"
            label="PCAP"
            type="info"
            link
            icon="file_download"
            disabled={props.selectedItems === null || props.selectedItems.length === 0}
            onClick={() => props.onDownloadPcaps()}
        />
    );

    const downloadSdp = (
        <Button
            className="lst-header-button"
            label="SDP"
            type="info"
            link
            icon="file_download"
            disabled={props.selectedItems === null || props.selectedItems.length === 0}
            onClick={props.onDownloadSdps}
        />
    );

    return (
        <div className="lst-table-actions">
            {deleteButton}
            {selectBefore}
            {selectAfter}
            {downloadPcap}
            {downloadSdp}
        </div>
    );
}

PcapActions.propTypes = {
    selectedItems: PropTypes.array,
    onDelete: PropTypes.func,
    onSelectBefore: PropTypes.func,
    onSelectAfter: PropTypes.func,
    onDownloadPcaps: PropTypes.func,
    onDownloadSdps: PropTypes.func,
};

PcapActions.defaultProps = {
    selectedItems: [],
    onDelete: () => { },
    onSelectBefore: () => { },
    onSelectAfter: () => { },
    onDownloadPcaps: () => { },
    onDownloadSdps: () => { },
};

export default PcapActions;
