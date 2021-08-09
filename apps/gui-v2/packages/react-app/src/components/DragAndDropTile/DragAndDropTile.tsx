import React from 'react';
import './styles.scss';

function DragAndDropTile() {
    return (
        <div className="drag-and-drop-tile">
            <div className="drag-and-drop-tile-content">
                <span>
                    Drag and drop or <br /> + Add File
                </span>
            </div>
        </div>
    );
}

export default DragAndDropTile;
