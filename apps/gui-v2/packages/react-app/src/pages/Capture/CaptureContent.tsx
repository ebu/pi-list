import React from 'react';
import Select from 'react-select';
import SDK from '@bisect/ebu-list-sdk';
import list from '../../utils/api';
import { CustomScrollbar } from '../../components';
import CaptureHeaderHOC from './Header/CaptureHeaderHOC';
import './styles.scss';

interface IComponentProps {
    onCapture: (name: string, duration: number, source: string) => void;
}

function CaptureContent({
    onCapture
}: IComponentProps) {
    const modes = [
        {
            value: 'parallel',
            label: 'Parallel',
        },
        {
            value: 'sequential',
            label: 'Sequential',
        },
    ];
    const [multicast, setMulticast] = React.useState('');
    const [name, setName] = React.useState('');
    const [duration, setDuration] = React.useState('2000');
    const [mode, setMode] = React.useState(modes[0]);

    const onChangeMulticast = (value: any) => { setMulticast(value); };
    const onChangeName = (value: any) => { setName(value); };
    const onChangeDuration = (value: any) => { setDuration(value); };
    const onChangeMode = (value: any) => { setMode(value); };
    const onPressCapture = () => {
        onCapture(name, parseInt(duration), multicast);
    };

    return (
        <>
            <div className="main-page-header">
                <CaptureHeaderHOC />
            </div>
            <div className="main-page-dashboard">
                <div className="capture-page-container">
                    <div className="capture-container">
                        <div className="capture-title">
                            <span>Capture</span>
                        </div>
                        <div className="capture-content-row">
                            <div className="capture-page-select">
                                <div className="capture-settings-container">
                                    <div className="capture-settings-label-container">
                                        <span className="capture-settings-label">Multicast</span>
                                    </div>
                                    <input
                                        type="text"
                                        className="capture-panel-input"
                                        value={multicast}
                                        onChange={evt => onChangeMulticast(evt.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="capture-page-select">
                                <div className="capture-settings-container">
                                    <div className="capture-settings-label-container">
                                        <span className="capture-settings-label">Name</span>
                                    </div>
                                    <input
                                        type="text"
                                        className="capture-panel-input"
                                        value={name}
                                        onChange={evt => onChangeName(evt.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="capture-page-select">
                                <div className="capture-settings-container">
                                    <div className="capture-settings-label-container">
                                        <span
                                        className="capture-settings-label">Duration (ms)</span>
                                    </div>
                                    <input
                                        type="text"
                                        className="capture-panel-input"
                                        value={duration}
                                        onChange={evt => onChangeDuration(evt.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="capture-content-row">
                            <div className="capture-page-select">
                                <div className="capture-settings-container">
                                    <div className="capture-settings-label-container">
                                        <span className="capture-settings-label">Mode</span>
                                    </div>
                                    <Select
                                        options={modes}
                                        onChange={onChangeMode}
                                        value={mode}
                                    ></Select>
                                </div>
                            </div>
                            <button
                            className="capture-page-capture-button" onClick={onPressCapture}>
                                Capture
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default CaptureContent;
