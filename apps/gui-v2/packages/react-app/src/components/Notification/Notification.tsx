import React from 'react';
import { toast, ToastContent } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles.scss';

const getToast = (typeMessage: string, message: ToastContent) => {
    switch (typeMessage) {
        case 'success':
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

function Notification({ typeMessage, message }: { typeMessage: string; message: ToastContent }) {
    return getToast(typeMessage, message);
}

export default Notification;
