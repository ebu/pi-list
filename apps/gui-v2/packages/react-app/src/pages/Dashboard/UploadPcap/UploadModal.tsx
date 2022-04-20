import React from 'react';
import Modal from 'react-modal';
import './styles.scss';
import _ from 'lodash';
import list from '../../../utils/api';
import PcapUploadInformation from './PcapUploadInformation';
import { CancelIcon } from 'components/icons';


interface IComponentProps {
    isOpen: boolean;
    onUploadDone: () => void;
    onModalClose: () => void;
    receivedFiles: any[];
}

const UploadModal = ({
    isOpen,
    onUploadDone,
    onModalClose,
    receivedFiles
}: IComponentProps) => {

    const [filesToAnalyze, setFilesToAnalyze] = React.useState<any[]>(receivedFiles);

    const customStylesModal = {
        overlay: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            zIndex: "1000"
        },
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: "70%",
            height: "60%",
            backgroundColor: '#0A102B',
            zIndex: "1000"
        },
    };

    const onChangeProtocol = (receivedFile: any, e: any) => {
        const filesToAnalyzePatched = _.cloneDeep(filesToAnalyze);
        const objIndex = filesToAnalyzePatched.findIndex((obj => obj.pcap_id == receivedFile.pcap_id));
        //Update object's transport type property.
        filesToAnalyzePatched[objIndex].transport_type = e.target.value;

        setFilesToAnalyze(filesToAnalyzePatched);
    }

    const onUpload = () => {
        filesToAnalyze.map((file) => {
            list.pcap.patch(file.pcap_id, { sdps: file.sdps, transport_type: file.transport_type })
                .catch((err) => {
                    console.error("ERROR WHILE UPLOADING PCAP:", err);
                })
        })
        onUploadDone();

    }

    const patchPcap = (pcapId: any, sdps: any) => {
        const filesToAnalyzePatched = _.cloneDeep(filesToAnalyze);

        const objIndex = filesToAnalyzePatched.findIndex((obj => obj.pcap_id == pcapId));
        filesToAnalyzePatched[objIndex].sdps = [];
        //Update object's sdp property.
        sdps.map((sdp: any) => {
            filesToAnalyzePatched[objIndex].sdps.push(sdp.sdpParsed)
        })

        setFilesToAnalyze(filesToAnalyzePatched);
    }

    return (
        <div id="main">
            <Modal
                isOpen={isOpen}
                contentLabel="PCAP Upload"
                style={customStylesModal}
                onRequestClose={() => onModalClose()}
                ariaHideApp={false}
            >
                <div className='close-pcap-modal-button-container'>
                    <span className='upload-pcap-modal-title'>Upload PCAP</span>
                    <CancelIcon onClick={() => onModalClose()} className='cancel-icon-sdp-upload' />
                </div>
                <div className='pcap-modal-form-container'>
                    {receivedFiles.map((receivedFile: any) => {
                        console.log(receivedFiles)
                        return (
                            <PcapUploadInformation key={receivedFile.pcap_id} receivedPcap={receivedFile} patchPcap={patchPcap} filesToAnalyze={filesToAnalyze} onChangeProtocol={onChangeProtocol} />
                        )
                    })}
                </div>
                <div className='upload-pcap-modal-button-container'>
                    <a className='upload-pcap-modal-upload-button' onClick={() => onUpload()}>Upload</a>
                </div>
            </Modal>
        </div>
    );
}

export default UploadModal;
