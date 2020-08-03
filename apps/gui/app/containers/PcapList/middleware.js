import { types as workflowTypes } from 'ebu_list_common/workflows/types';
import notifications from '../../utils/notifications';
import Actions from './Actions';
import api from '../../utils/api';
import { translate } from '../../utils/translation';
import { getFullInfoFromId, DownloadOriginal, DownloadPcap, DownloadSDP, DownloadJson, DownloadPdf } from './utils';

const DownloadMultipleFiles = (downloadType, ids) => {
    const workflowInfo = {
        type: workflowTypes.downloadMultipleFiles,
        configuration: {
            ids: ids,
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
};

const middleware = (state, action) => {
    const multipleSelection = state.selected.length > 1;

    switch (action.type) {
        case Actions.reanalyzePcap:
            {
                const id = action.data.id;

                api.updatePcapAnalysis(id)
                    .then(() => {})
                    .catch(() => {});
            }
            break;

        case Actions.deletePcap:
            {
                const id = action.data.id;
                const pcap = getFullInfoFromId(id, state.data);
                const filename = pcap && pcap.file_name;

                api.deletePcap(id)
                    .then(() => {
                        notifications.success({
                            title: translate('notifications.success.pcap_deleted'),
                            message: translate('notifications.success.pcap_deleted_message', { name: filename }),
                        });
                    })
                    .catch(() => {
                        notifications.error({
                            title: translate('notifications.error.pcap_deleted'),
                            message: translate('notifications.error.pcap_deleted_message', { name: filename }),
                        });
                    });
            }
            break;

        case Actions.downloadSelectOriginalCapture:
            if (multipleSelection) DownloadMultipleFiles('orig', state.selected);
            else {
                DownloadOriginal(state.selected[0])
                    .then()
                    .catch(() => {
                        notifications.error({
                            titleTag: 'workflow.request_failed',
                            messageTag: 'workflow.request_failed',
                        });
                    });
            }
            break;

        case Actions.downloadSelectedPcap:
            if (multipleSelection) DownloadMultipleFiles('pcap', state.selected);
            else {
                DownloadPcap(state.selected[0])
                    .then()
                    .catch(() => {
                        notifications.error({
                            titleTag: 'workflow.request_failed',
                            messageTag: 'workflow.request_failed',
                        });
                    });
            }
            break;

        case Actions.downloadSelectedSdp:
            if (multipleSelection) DownloadMultipleFiles('sdp', state.selected);
            else {
                DownloadSDP(state.selected[0])
                    .then()
                    .catch(() => {
                        notifications.error({
                            titleTag: 'workflow.request_failed',
                            messageTag: 'workflow.request_failed',
                        });
                    });
            }
            break;

        case Actions.downloadSelectedJsonReport:
            if (multipleSelection) DownloadMultipleFiles('json', state.selected);
            else {
                DownloadJson(state.selected[0])
                    .then()
                    .catch(() => {
                        notifications.error({
                            titleTag: 'workflow.request_failed',
                            messageTag: 'workflow.request_failed',
                        });
                    });
            }
            break;

        case Actions.downloadSelectedPdfReport:
            if (multipleSelection) DownloadMultipleFiles('pdf', state.selected);
            else {
                DownloadPdf(state.selected[0])
                    .then()
                    .catch(() => {
                        notifications.error({
                            titleTag: 'workflow.request_failed',
                            messageTag: 'workflow.request_failed',
                        });
                    });
            }
            break;

        default:
            break;
    }
};

export { middleware };
