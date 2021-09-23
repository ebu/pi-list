import React from 'react';
import list from '../../../utils/api';
import SDK from '@bisect/ebu-list-sdk';
import { SetterOrUpdater, useSetRecoilState } from 'recoil';
import { pcapsAtom } from './pcaps';
import { pcapsAnalysingAtom } from './pcapsAnalysing';
import _ from 'lodash';
import { Notification } from 'components/index';

const handlePcapsUpdate = (
    data: any,
    setPcapsAtom: SetterOrUpdater<SDK.types.IPcapInfo[]>,
    setPcapsAnalysingAtom: SetterOrUpdater<SDK.types.IPcapFileReceived[]>
) => {
    switch (data.event) {
        case 'PCAP_FILE_RECEIVED':
            setPcapsAnalysingAtom(current => {
                return [...current, data.data];
            });
            break;
        case 'PCAP_FILE_PROCESSED':
            setPcapsAnalysingAtom(current => {
                const cloneCurrent = _.cloneDeep(current);
                const index = cloneCurrent.findIndex(element => element.id === data.data.id);
                cloneCurrent[index].progress = data.data.progress;
                return cloneCurrent;
            });
            break;
        case 'PCAP_FILE_ANALYZING':
            setPcapsAnalysingAtom(current => {
                const cloneCurrent = _.cloneDeep(current);
                const index = cloneCurrent.findIndex(element => element.id === data.data.id);
                cloneCurrent[index].progress = data.data.progress;
                console.log(data.data.progress);
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
                return current.filter((pcap: SDK.api.pcap.IPcapInfo) => pcap.id !== data.data.id);
            });
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

    const onPcapsUpdate = React.useCallback(data => handlePcapsUpdate(data, setPcapsAtom, setPcapsAnalysingAtom), [
        setPcapsAtom,
        setPcapsAnalysingAtom,
    ]);

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
