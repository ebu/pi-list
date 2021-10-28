import React from 'react';
import list from '../../../utils/api';
import SDK from '@bisect/ebu-list-sdk';
import { api } from '@bisect/ebu-list-sdk';
import { SetterOrUpdater, useSetRecoilState } from 'recoil';
import { streamComparisonAtom } from './streamComparison';
import _ from 'lodash';
import { Notification } from 'components/index';

const handleStreamComparisonUpdate = async (data: any, setStreamComparisonAtom: SetterOrUpdater<any[]>) => {
    switch (data.event) {
        case api.wsEvents.Stream.compare_complete:
            await list.streamComparison.getAll().then((comparisonData: any) => {
                Notification({
                    typeMessage: 'success',
                    message: (
                        <div>
                            <p>Stream Comparison Completed</p>
                            <p> {data.data.msg} </p>
                        </div>
                    ),
                });
                setStreamComparisonAtom(current => {
                    const comparisonsSortedByDate = comparisonData
                        .slice()
                        .sort((a: any, b: any) => (a.date < b.date ? 1 : a.date === b.date ? 0 : -1));

                    return comparisonsSortedByDate;
                });
            });

            break;
        case api.wsEvents.Stream.compare_failed:
            Notification({
                typeMessage: 'error',
                message: (
                    <div>
                        <p>Stream Comparison failed</p>
                        <p> {data.data.msg} </p>
                    </div>
                ),
            });
            break;
        case api.wsEvents.Stream.compare_deleted:
            setStreamComparisonAtom(current => {
                return current.filter((stream: any) => stream.id !== data.data.id);
            });
            break;
    }
};

export default () => {
    const setStreamComparisonAtom = useSetRecoilState(streamComparisonAtom);

    React.useEffect(() => {
        const loadComparisons = async (): Promise<void> => {
            const all = await list.streamComparison.getAll();
            const comparisonsSortedByDate = all
                .slice()
                .sort((a: any, b: any) => (a.date < b.date ? 1 : a.date === b.date ? 0 : -1));
            setStreamComparisonAtom(comparisonsSortedByDate);
        };
        loadComparisons();
    }, []);

    const wsClient = list.wsClient;

    const onStreamComparisonUpdate = React.useCallback(
        data => handleStreamComparisonUpdate(data, setStreamComparisonAtom),
        [setStreamComparisonAtom]
    );

    React.useEffect(() => {
        if (wsClient === (null || undefined)) {
            return;
        }

        wsClient.on('message', onStreamComparisonUpdate);

        return () => {
            wsClient.off('message', onStreamComparisonUpdate);
        };
    }, [handleStreamComparisonUpdate, wsClient]);
};
