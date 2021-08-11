import React from 'react';
import { ZoomInIcon, ZoomOutIcon, VolumeDownIcon, VolumeUpIcon } from '../icons/index';
import './styles.scss';

interface IComponentProps {
    min: number;
    max: number;
    type: string;
    onChange: (e: any) => void;
    step?: number;
    initialValue: number;
}

function SliderAudioPlayer({ min, max, type, onChange, step, initialValue }: IComponentProps) {
    const [value, setValue] = React.useState(initialValue);
    const icon_low = type === 'zoom' ? 'zoom_out' : 'volume_lower';
    const icon_high = type === 'zoom' ? 'zoom_in' : 'volume_higher';

    const onChangeValue = (e: any) => {
        e.persist();
        setValue(e.target.value);
        onChange(e.target.value);
    };
    //Missing icons
    return (
        <div className="slider-container">
            {icon_low === 'zoom_out' ? (
                <ZoomOutIcon className="audio-player-icons-to-fit" />
            ) : (
                <VolumeDownIcon className="audio-player-icons-to-fit" />
            )}

            <input type="range" min={min} max={max} step={step} value={value} onChange={onChangeValue} />
            {icon_high === 'zoom_in' ? (
                <ZoomInIcon className="audio-player-icons-to-fit" />
            ) : (
                <VolumeUpIcon className="audio-player-icons-to-fit" />
            )}
        </div>
    );
}

export default SliderAudioPlayer;
