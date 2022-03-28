import { CancelIcon } from 'components/icons';
import { Dispatch } from 'react';



function UploadSdpSuccess({ receivedSdps, setUploadedSdps, pcapId }: { receivedSdps: any[], setUploadedSdps: (sdps: any) => void, pcapId: string  }) {

    const onCancelClick = (sdpToDelete: any) => {
        const filteredSdps = receivedSdps.filter(function(value, index, arr){
            return value.sdpFile.id !== sdpToDelete.sdpFile.id;
        })
        setUploadedSdps(filteredSdps);
    }

    return (
        <div className="upload-sdp-success-container">
            {receivedSdps.map(receivedSdp => {
                return (
                    <div key={receivedSdp.id} className='upload-sdp-file-name-container'>
                        <span className='upload-sdp-file-name'>
                            {receivedSdp.sdpFile.name}
                        </span>
                        <CancelIcon onClick={() => onCancelClick(receivedSdp)} className='cancel-icon-sdp-upload' />
                    </div>
                )
            })}
        </div>
    );
}

export default UploadSdpSuccess;
