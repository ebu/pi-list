import notifications from '../../utils/notifications';
import Actions from './Actions';
import api from '../../utils/api';
import { translate } from '../../utils/translation';
import { getFullInfoFromId } from './utils';
import { downloadFileFromUrl } from '../../utils/download';
import { types as workflowTypes } from 'ebu_list_common/workflows/types';

const middleware = (state, action) => {
    var downloadUrl = null;
    var downloadType = null;
    const multipleSelection = state.selected.length > 1;

    switch (action.type) {

        case Actions.reanalyzePcap: {
            const id = action.data.id;
            const pcap = getFullInfoFromId(id, state.data);
            const filename = pcap && pcap.file_name;

            api.updatePcapAnalysis(id)
                .then(() => {
                })
                .catch(() => {
                });
        }
            break;

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

        case Actions.downloadSelectOriginalCapture: {
            downloadUrl = api.downloadOriginalCaptureUrl(state.selected[0]);
            downloadType = 'orig';
        }
            break;

        case Actions.downloadSelectedPcap: {
            downloadUrl = api.downloadPcapUrl(state.selected[0]);
            downloadType = 'pcap';
        }
            break;

        case Actions.downloadSelectedSdp: {
            downloadUrl = api.downloadSDPUrl(state.selected[0]);
            downloadType = 'sdp';
        }
            break;

        case Actions.downloadSelectedJsonReport: {
            downloadUrl = api.downloadJsonUrl(state.selected[0]);
            downloadType = 'json';
        }
            break;

        case Actions.downloadSelectedPdfReport: {
            downloadUrl = api.downloadPdfUrl(state.selected[0]);
            downloadType = 'pdf';
        }
            break;

        default:
            break;
    }

    if (downloadUrl) {
        if (multipleSelection) {
            const workflowInfo = {
                type: workflowTypes.downloadMultipleFiles,
                configuration: {
                    ids: state.selected,
                    type: downloadType,
                },
            };

            api.createWorkflow(workflowInfo)
                .then(() => {
                    notifications.success({
                        titleTag: 'workflow.requested',
                        messageTag: 'workflow.requested',
                    });
                })
                .catch(() => {
                    notifications.error({
                        titleTag: 'workflow.request_failed',
                        messageTag: 'workflow.request_failed',
                    });
                });
        }
        else { // single file
            downloadFileFromUrl(downloadUrl);
        }
    }
};

export {
    middleware
};
