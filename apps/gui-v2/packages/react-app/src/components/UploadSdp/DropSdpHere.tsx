import React from 'react';
import { CalendarIcon } from '../icons/index';
import './styles.scss';

function DropSdpHere() {
    return (
        <div className="drag-and-drop-tile-content-upload active">
            <CalendarIcon />
            <span>Drop the a sdp here</span>
        </div>
    );
}

export default DropSdpHere;