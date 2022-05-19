import React from 'react';
import SDK from '@bisect/ebu-list-sdk';
import list from '../../utils/api';
import { CustomScrollbar } from '../../components';
import DownloadManagerHeaderHOC from './Header/DownloadManagerHeaderHOC';
import './styles.scss';

function DownloadManagerContent({ downloadData }: { downloadData: SDK.types.IDownloadManagerDataContent[] }) {
    const downloadFile = async (fileItem: SDK.types.IDownloadManagerDataContent) => {
        const response = await list.downloadManager.download(fileItem.id);
        const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', fileItem.name);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    return (
        <>
            <div className="main-page-header">
                <DownloadManagerHeaderHOC />
            </div>
            <div className="main-page-dashboard">
                <CustomScrollbar>
                    <div className="download-manager-container">
                        <div className="download-manager-table-container">
                            <table className="download-manager-table">
                                <thead>
                                    <tr className="download-manager-table-header-table-row">
                                        <th>Name</th>
                                        <th className="download-manager-table-centered-header-label">Available On</th>
                                        <th className="download-manager-table-centered-header-label">
                                            Available Until
                                        </th>
                                        <th className="download-manager-table-centered-header-label"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {downloadData.map((item: SDK.types.IDownloadManagerDataContent) => {
                                        return (
                                            <tr className="download-manager-table-row" key={item.name}>
                                                <td className="download-manager-name-data-container">
                                                    <span className="download-table-label">{item.name}</span>
                                                </td>
                                                <td className="download-manager-centered-value">
                                                    <span className="download-table-label">
                                                        {item.availableonfancy}
                                                    </span>
                                                </td>
                                                <td className="download-manager-centered-value">
                                                    <span className="download-table-label">
                                                        {item.availableuntilfancy}
                                                    </span>
                                                </td>
                                                <td className="download-manager-centered-value">
                                                    <button
                                                        className="download-manager-button"
                                                        onClick={() => downloadFile(item)}
                                                    >
                                                        Download
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CustomScrollbar>
            </div>
        </>
    );
}

export default DownloadManagerContent;
