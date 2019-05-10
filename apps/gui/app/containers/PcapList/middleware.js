import notifications from '../../utils/notifications';
import Actions from './Actions';
import api from '../../utils/api';
import { translate } from '../../utils/translation';
import { getFullInfoFromId } from './utils';
import { downloadFiles } from '../../utils/download';

const middleware = (state, action) => {
    switch (action.type) {
        case Actions.deletePcap: {
            const id = action.data.id;
            const pcap = getFullInfoFromId(id, state.data);
            const filename = pcap && pcap.file_name;

            api.deletePcap(id)
                .then(() => {
                    notifications.success({
                        title: translate('notifications.success.pcap_deleted'),
                        message: translate('notifications.success.pcap_deleted_message', { name: filename })
                    });
                })
                .catch(() => {
                    notifications.error({
                        title: translate('notifications.error.pcap_deleted'),
                        message: translate('notifications.error.pcap_deleted_message', { name: filename })
                    });
                });
        }
            break;

        case Actions.downloadSelectedPcap: {
            const filesForDownload = state.selected.map(id => api.downloadPcapUrl(id));
            downloadFiles(filesForDownload);
        }
            break;

        case Actions.downloadSelectedSdp: {
            const filesForDownload = state.selected.map(id => api.downloadSDPUrl(id));
            downloadFiles(filesForDownload);
        }
            break;

        case Actions.downloadSelectedReport: {
            const filesForDownload = state.selected.map(id => api.downloadJsonUrl(id));
            downloadFiles(filesForDownload);
        }
            break;

        default:
            break;
    }
};

export {
    middleware
};
