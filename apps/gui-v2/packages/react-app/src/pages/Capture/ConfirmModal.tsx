import React from 'react';
import Modal from 'react-modal';
import SourceInfo from './SourceInfo';
import './styles.scss';

interface IComponentProps {
    message: string;
    isOpen: boolean;
    onConfirm: () => void;
}

function ConfirmModal({
    message,
    isOpen,
    onConfirm,
}: IComponentProps) {
    return (
        <div>
            <Modal
                isOpen={isOpen}
                contentLabel="Live Source Modal"
                className="live-source-modal-content"
                overlayClassName="live-source-modal-overlay"
            >
                <form>
                    <div className="capture-page-container">
                        <div className="capture-container">
                            <span className="capture-settings-label">
                                Do you really want to {message}?
                            </span>
                            <div className="capture-content-row">
                                <div className="capture-page-select">
                                    <button className="capture-page-capture-button" onClick={onConfirm}>
                                        Ok
                                    </button>
                                </div>
                                <div className="capture-page-select">
                                    <button className="capture-page-capture-button">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

export default ConfirmModal;
