import React from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles.scss';

const getToast = (typeMessage: string, message: string | React.ReactElement) => {
    switch (typeMessage) {
        case 'sucess':
            toast.success(message, {
                position: 'bottom-right',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: false,
                progress: undefined,
            });
            break;
        case 'error':
            toast.error(message, {
                position: 'bottom-right',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: false,
                progress: undefined,
            });
            break;
    }
};
function Notification({ typeMessage, message }: { typeMessage: string; message: string | React.ReactElement }) {
    return getToast(typeMessage, message);
}

export default Notification;
