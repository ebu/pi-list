import './styles.scss';
import BaseSelector from '../BaseSelector/BaseSelector';
//TODO See what are the pcaps parameters and make the interface for it

function AudioChannelSelector({ channels, selectedChannel, onChange }: any) {
    const current = channels.find((channel: any) => channel.value === selectedChannel);
    return (
        <div className="audio-channel-selector-container">
            <span className="stream-comparison-panel-h3">Audio Channel:</span>
            <div>
                <BaseSelector options={channels} onChange={onChange} value={current}></BaseSelector>
            </div>
        </div>
    );
}

export default AudioChannelSelector;
