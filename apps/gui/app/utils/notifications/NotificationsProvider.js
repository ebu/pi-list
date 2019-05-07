import React, { Component } from 'react';
import _ from 'lodash';
import UploadProgress from '../../components/upload/UploadProgress';

// Create a new context for the app
export const NotificationsContext = React.createContext('app');

class Notifications extends Component {
    render() {
        const shouldDisplay = this.props.visible ? {} : { display: 'none' };

        return (
            <div className="lst-notifications-uploads"
                style={{ ...shouldDisplay }}
            >
                <UploadProgress
                    files={this.props.files}
                    isUploading={this.props.isUploading}
                    uploadComplete={this.props.uploadComplete}
                    uploadFailed={this.props.uploadFailed}
                    uploadProgress={this.props.uploadProgress}
                />
            </div>
        );
    }
}

// Creates a provider Component
class NotificationsProvider extends Component {
    constructor(props) {
        super(props);

        this.state = {
            uploads: [],
            uploadsVisible: false,
            timer: null
        };

        this.updateUpload = this.updateUpload.bind(this);
    }

    updateUpload(info) {
        this.setState({ uploadsVisible: true });

        if (
            (info.isUploading !== this.state.isUploading)
            || (info.uploadComplete !== this.state.uploadComplete)
            || (info.uploadFailed !== this.state.uploadFailed)
        ) {
            if (info.isUploading) {
                if (this.state.timer) {
                    clearTimeout(this.state.timer);
                }
                this.setState({ timer: null });
            } else {
                const timer = setTimeout(() => {
                    this.setState({ uploadsVisible: false });
                }, 3000);
                this.setState({ timer });
            }
        }

        this.setState({ uploads: info });
    }

    render() {
        return (
            <NotificationsContext.Provider
                value={{
                    state: this.state,
                    updateUpload: this.updateUpload
                }}
            >
                {this.props.children}
                <Notifications
                    files={this.state.uploads.files}
                    isUploading={this.state.uploads.isUploading}
                    uploadComplete={this.state.uploads.uploadComplete}
                    uploadFailed={this.state.uploads.uploadFailed}
                    uploadProgress={this.state.uploads.uploadProgress}
                    visible={this.state.uploadsVisible}
                />
            </NotificationsContext.Provider>
        );
    }
}

export default NotificationsProvider;