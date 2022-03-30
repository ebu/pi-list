import React from 'react';
import Modal from 'react-modal';
import SourceInfo from './SourceInfo';
import './styles.scss';

interface IComponentProps {
    isOpen: boolean;
    onAdd: (source: { label: string, multicast: string, port: string }) => void;
}

function AddSourceModal({
    isOpen,
    onAdd,
}: IComponentProps) {
    const [source, setSource] = React.useState<{ label: string, multicast: string, port: string } | undefined>();

    const onChange = (label: string, multicast: string, port: string) => {
        setSource({ label, multicast, port });
    }

    const onPressAdd = () => {
        if (typeof(source) != 'undefined') {
            onAdd(source);
        }
    };

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
                            <div className="capture-title">
                                <span>Live Source</span>
                            </div>
                            <SourceInfo
                                label={""}
                                multicast={""}
                                port={""}
                                onChange={onChange}
                            />
                            <div className="capture-content-row">
                                <div className="capture-page-select">
                                    <button className="capture-panel-capture-button" onClick={onPressAdd}>
                                        Add
                                    </button>
                                </div>
                                <div className="capture-page-select">
                                    <button className="capture-panel-capture-button">
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

export default AddSourceModal;
