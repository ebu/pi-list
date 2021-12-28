import './styles.scss';
import BaseSelector from '../BaseSelector/BaseSelector';
//TODO See what are the pcaps parameters and make the interface for it
interface IComponentProps {
    pcaps: any;
    selectedPcapId: any;
    onChange: (e: any) => void;
}

function PcapSelector({ pcaps, selectedPcapId, onChange }: IComponentProps) {
    const entries = pcaps.map((pcap: any) => ({ label: pcap.file_name, value: pcap.id }));
    const current = pcaps.find((pcap: any) => pcap.value === selectedPcapId);

    return (
        <div className="pcap-selector-container">
            <span className="stream-comparison-panel-h3">PCAP:</span>
            <div>
                <BaseSelector
                    options={entries}
                    onChange={(e: any) => {
                        onChange(e);
                    }}
                    value={current}
                ></BaseSelector>
            </div>
        </div>
    );
}

export default PcapSelector;
