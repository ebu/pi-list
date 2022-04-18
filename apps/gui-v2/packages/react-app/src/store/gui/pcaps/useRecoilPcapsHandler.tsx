import React from 'react';
import list from '../../../utils/api';
import SDK from '@bisect/ebu-list-sdk';
import api from '@bisect/ebu-list-sdk';
import { SetterOrUpdater, useSetRecoilState } from 'recoil';
import { pcapsAtom } from './pcaps';
import { pcapsCapturingAtom } from './pcapsCapturing';
import { pcapsAnalysingAtom } from './pcapsAnalysing';
import _ from 'lodash';
import { Notification } from 'components/index';
import { pcap } from '@bisect/ebu-list-sdk/dist/api';

const handlePcapsUpdate = (
    data: any,
    setPcapsAtom: SetterOrUpdater<SDK.types.IPcapInfo[]>,
    setPcapsCapturingAtom: SetterOrUpdater<SDK.types.IPcapFileCapturing[]>,
    setPcapsAnalysingAtom: SetterOrUpdater<SDK.types.IPcapFileReceived[]>
) => {
    switch (data.event) {
        case 'PCAP_FILE_CAPTURING':
            setPcapsCapturingAtom(current => {
                const cloneCurrent = _.cloneDeep(current);
                const index = cloneCurrent.findIndex(element => element.file_name === data.data.file_name);
                if (index !== -1) {
                    cloneCurrent[index].progress = data.data.progress;
                    return cloneCurrent;
                } else {
                    return [...current, data.data];
                }
            });
            break;
        case 'PCAP_FILE_RECEIVED':
            setPcapsCapturingAtom(current => {
                return current.filter(
                    (pcap: SDK.api.pcap.IPcapFileCapturing) => pcap.file_name !== data.data.file_name
                );
            });
            setPcapsAnalysingAtom(current => {
                return [...current, data.data];
            });
            break;
        case 'PCAP_FILE_PROCESSED':
            let existingPcap = false;
            setPcapsAtom(current => {
                const cloneCurrent = _.cloneDeep(current);
                const index = cloneCurrent.findIndex(element => element.id === data.data.id);
                if (index !== -1) {
                    existingPcap = true;
                    return current.filter((pcap: SDK.api.pcap.IPcapInfo) => pcap.id !== data.data.id);
                }

                return cloneCurrent;
            });
            setPcapsAnalysingAtom(current => {
                if (existingPcap) {
                    data.data.progress = 0;
                    return [...current, data.data];
                }
                const cloneCurrent = _.cloneDeep(current);
                const index = cloneCurrent.findIndex(element => element.id === data.data.id);
                if (index !== -1) {
                    cloneCurrent[index].progress = data.data.progress;
                }
                return cloneCurrent;
            });
            break;
        case 'PCAP_FILE_ANALYZING':
            setPcapsAnalysingAtom(current => {
                const cloneCurrent = _.cloneDeep(current);
                const index = cloneCurrent.findIndex(element => element.id === data.data.id);
                if (index !== -1) {
                    cloneCurrent[index].progress = data.data.progress;
                }
                return cloneCurrent;
            });
            break;
        case 'PCAP_FILE_PROCESSING_DONE':
            setPcapsAnalysingAtom(current => {
                return current.filter((pcap: SDK.api.pcap.IPcapFileReceived) => pcap.id !== data.data.id);
            });
            setPcapsAtom(current => {
                return [data.data, ...current];
            });
            break;

        case 'PCAP_FILE_FAILED':
            setPcapsAnalysingAtom(current => {
                return current.filter((pcap: SDK.api.pcap.IPcapFileReceived) => pcap.id !== data.data.id);
            });
            break;

        case 'PCAP_FILE_DELETED':
            setPcapsAtom(current => {
                console.log("DELETE THIS ONE", current);
                return current.filter((pcap: SDK.api.pcap.IPcapInfo | any) => pcap.id !== data.data.id);
            });
            setPcapsAnalysingAtom(current => {
                return current.filter((pcap: any) => pcap.id !== data.data.id);
            })
            break;

        case 'ZIP_FILE_COMPLETE':
            Notification({
                typeMessage: 'sucess',
                message: (
                    <div>
                        <p>Zip Complete</p>
                        <p> {data.data.msg} </p>
                    </div>
                ),
            });
            break;

        case 'ZIP_FILE_FAILED':
            Notification({
                typeMessage: 'error',
                message: (
                    <div>
                        <p>Zip Failed</p>
                        <p> {data.data.msg} </p>
                    </div>
                ),
            });
            break;
    }
};

export default () => {
    const setPcapsAtom = useSetRecoilState(pcapsAtom);
    const setPcapsCapturingAtom = useSetRecoilState(pcapsCapturingAtom);
    const setPcapsAnalysingAtom = useSetRecoilState(pcapsAnalysingAtom);

    React.useEffect(() => {
        const loadPcaps = async (): Promise<void> => {
            const all = await list.pcap.getAll();
            const pcapsSortedByDate = all.slice().sort((a, b) => (a.date < b.date ? 1 : a.date === b.date ? 0 : -1));
            setPcapsAtom(pcapsSortedByDate);
        };
        loadPcaps();
    }, []);

    const wsClient = list.wsClient;

    const onPcapsUpdate = React.useCallback(
        (data: any) => handlePcapsUpdate(data, setPcapsAtom, setPcapsCapturingAtom, setPcapsAnalysingAtom),
        [setPcapsAtom, setPcapsCapturingAtom, setPcapsAnalysingAtom]
    );

    React.useEffect(() => {
        if (wsClient === (null || undefined)) {
            return;
        }

        wsClient.on('message', onPcapsUpdate);

        return () => {
            wsClient.off('message', onPcapsUpdate);
        };
    }, [handlePcapsUpdate, wsClient]);
};
