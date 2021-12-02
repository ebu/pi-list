
import React from 'react';
import Modal from 'react-modal';
import './styles.scss';

interface IComponentProps {
    label: string;
    multicast: string;
    port: string;
    onChange: (label: string, multicast: string, port: string) => void;
}

function SourceInfo({
    label,
    multicast,
    port,
    onChange,
}: IComponentProps) {
    const [localLabel, setLocalLabel] = React.useState<string>(label);
    const [localMulticast, setLocalMulticast] = React.useState<string>(multicast);
    const [localPort, setLocalPort] = React.useState<string>(port);

    React.useEffect(() => {
        //TOTO validatelocalMulticast field
        if (localLabel && localMulticast && localPort) {
            onChange(localLabel, localMulticast, isNaN(parseInt(localPort))? '0' : localPort);
        }
    }, [localLabel, localMulticast, localPort]);

    return (
        <div>
            <div className="capture-content-row">
                <div className="capture-page-select">
                    <div className="capture-settings-container">
                        <div className="capture-settings-label-container">
                            <span className="capture-settings-label">Label</span>
                        </div>
                        <input
                            type="text"
                            className="capture-panel-input"
                            value={localLabel}
                            onChange={evt => setLocalLabel(evt.target.value)}
                        />
                    </div>
                </div>
                <div className="capture-page-select">
                    <div className="capture-settings-container">
                        <div className="capture-settings-label-container">
                            <span className="capture-settings-label">Multicast</span>
                        </div>
                        <input
                            type="text"
                            className="capture-panel-input"
                            value={localMulticast}
                            onChange={evt => setLocalMulticast(evt.target.value)}
                        />
                    </div>
                </div>
                <div className="capture-page-select">
                    <div className="capture-settings-container">
                        <div className="capture-settings-label-container">
                            <span className="capture-settings-label">Port</span>
                        </div>
                        <input
                            type="text"
                            className="capture-panel-input"
                            value={localPort}
                            onChange={evt => setLocalPort(evt.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SourceInfo;
