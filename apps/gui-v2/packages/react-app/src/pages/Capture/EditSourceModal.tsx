import React from 'react';
import Modal from 'react-modal';
import SourceInfo from './SourceInfo';
import './styles.scss';

interface IComponentProps {
    source: any | undefined,
    isOpen: boolean;
    onEdit: (source: { id: string, label: string, multicast: string, port: string }) => void;
}

function EditSourceModal({
    source,
    isOpen,
    onEdit,
}: IComponentProps) {
    const [localSource, setSource] = React.useState<{ id: string, label: string, multicast: string, port: string }>({
        "id": source.id,
        "label": source.meta.label,
        "multicast": source.sdp.streams[0].dstAddr,
        "port": source.sdp.streams[0].dstPort,
    });
    const onChange = (label: string, multicast: string, port: string) => {
        setSource({ "id": localSource.id, label, multicast, port });
    }

    const onPressOK = () => {
        onEdit(localSource);
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
                                label={localSource.label}
                                multicast={localSource.multicast}
                                port={localSource.port}
                                onChange={onChange}
                            />
                            <div className="capture-content-row">
                                <div className="capture-page-select">
                                    <button className="capture-panel-capture-button" onClick={onPressOK}>
                                        OK
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

export default EditSourceModal;
