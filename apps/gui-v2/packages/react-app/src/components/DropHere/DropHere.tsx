import React from 'react';
import { CalendarIcon } from '../icons/index';
import './styles.scss';
function DropHere() {
    return (
        <div className="drag-and-drop-tile-content-upload active">
            <CalendarIcon />
            <span>Drop the file here</span>
        </div>
    );
}

export default DropHere;
