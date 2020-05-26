import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import UploadProgress, { FileShape } from '../../components/upload/UploadProgress';

// Create a new context for the app
export const NotificationsContext = React.createContext('app');

const Notifications = props => {
    const shouldDisplay = props.visible ? {} : { display: 'none' };

    return (
        <div className="lst-notifications-uploads" style={{ ...shouldDisplay }}>
            <UploadProgress files={props.files} />
        </div>
    );
};

Notifications.propTypes = {
    visible: PropTypes.bool.isRequired,
    files: PropTypes.arrayOf(FileShape),
};

Notifications.defaultProps = {
    files: [],
};

const isUploading = files => {
    if (!Array.isArray(files)) return false;
    if (files.length === 0) return false;
    return files.some(f => f.isUploading === true);
};

const NotificationsProvider = props => {
    const [uploads, setUploads] = useState([]);
    const [uploadsVisible, setUploadsVisible] = useState(false);
    const [timer, setTimer] = useState(null);

    const updateUpload = useCallback(info => {
        setUploadsVisible(true);

        if (!_.isEqual(info, uploads)) {
            if (isUploading(info.files)) {
                if (timer) {
                    clearTimeout(timer);
                }
                setTimer(null);
            } else {
                if (timer !== null) {
                    clearTimeout(timer);
                }

                const t = setTimeout(() => {
                    setUploadsVisible(false);
                }, 3000);
                setTimer(t);
            }
        }

        setUploads(_.cloneDeep(info));
    });

    return (
        <NotificationsContext.Provider
            value={{
                updateUpload: updateUpload,
            }}
        >
            {props.children}
            <Notifications
                files={uploads.files}
                isUploading={uploads.isUploading}
                uploadComplete={uploads.uploadComplete}
                uploadFailed={uploads.uploadFailed}
                uploadProgress={uploads.uploadProgress}
                visible={uploadsVisible}
            />
        </NotificationsContext.Provider>
    );
};

export default NotificationsProvider;
