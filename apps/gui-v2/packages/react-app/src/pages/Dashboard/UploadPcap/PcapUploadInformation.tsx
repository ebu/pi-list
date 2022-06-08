import './styles.scss';
import Select from 'react-select';
import { Dispatch } from 'react';
import { customStyles } from 'components/BaseSelector/BaseSelector';
import UploadSdp from './UploadSdp';
import React from 'react';

interface IComponentProps {
    receivedPcap: any;
    onChangeProtocol: (receivedFile: any, value: any) => void;
    patchPcap: (pcapId: string, sdps: any) => void;
    filesToAnalyze: any;
}

const PcapUploadInformation = ({ receivedPcap, onChangeProtocol, patchPcap, filesToAnalyze }: IComponentProps) => {
    const getCurrentFile = () => {
        const currentFile = filesToAnalyze.find((file: any) => {
            return file.pcap_id === receivedPcap.pcap_id;
        });

        return currentFile;
    };

    const isChecked = (type: string) => {
        const currentFile = getCurrentFile();
        if (!currentFile) return false;
        if (!currentFile.transport_type && type === 'RTP') {
            return true;
        }

        return currentFile.transport_type === type;
    };

    return (
        <div className="pcap-modal-container">
            <span className="pcap-modal-name">{receivedPcap.file_name}</span>
            <div className="pcap-modal-text-area-select-container">
                <UploadSdp key={receivedPcap.pcap_id} patchPcap={patchPcap} pcapId={receivedPcap.pcap_id} />
            </div>
            <div className="pcap-upload-information-radio-buttons-container">
                <label>
                    <input
                        type="radio"
                        checked={isChecked('RTP')}
                        value="RTP"
                        name={`rtp-radio-button-${receivedPcap.pcap_id}`}
                        onChange={e => onChangeProtocol(receivedPcap, e)}
                    />{' '}
                    RTP{' '}
                </label>
                <label>
                    <input
                        type="radio"
                        checked={isChecked('SRT')}
                        value="SRT"
                        name={`srt-radio-button-${receivedPcap.pcap_id}`}
                        onChange={e => onChangeProtocol(receivedPcap, e)}
                    />{' '}
                    SRT{' '}
                </label>
            </div>
        </div>
    );
};

export default PcapUploadInformation;
