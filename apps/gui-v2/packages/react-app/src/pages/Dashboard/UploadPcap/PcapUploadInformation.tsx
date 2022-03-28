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
}

const PcapUploadInformation = ({
    receivedPcap,
    onChangeProtocol,
    patchPcap
}: IComponentProps) => {

    const values = [{
        value: "SRT",
        label: "SRT"
    }, {
        value: "RTP",
        label: "RTP"
    }]


    return (
        <div className='pcap-modal-container'>
            <div className='pcap-modal-name' key={receivedPcap.pcap_id}>{receivedPcap.file_name}</div>
            <div className='pcap-modal-text-area-select-container'>
                <UploadSdp patchPcap={patchPcap} pcapId={receivedPcap.pcap_id} />
                <div className="pcap-upload-information-radio-buttons-container" onChange={(e) => onChangeProtocol(receivedPcap, e)}>
                    <label><input type="radio" value="RTP" name="transport_type" defaultChecked={true}/> RTP </label>
                    <label><input type="radio" value="SRT" name="transport_type" /> SRT </label>
                </div>
            </div>
        </div>
    )
}

export default PcapUploadInformation;
