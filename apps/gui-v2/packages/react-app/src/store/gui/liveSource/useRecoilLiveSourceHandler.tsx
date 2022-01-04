import React from 'react';
import list from '../../../utils/api';
import { api } from '@bisect/ebu-list-sdk';
import { SetterOrUpdater, useSetRecoilState } from 'recoil';
import { liveSourceAtom } from './liveSource';
import _ from 'lodash';
import { Notification } from 'components/index';

const handleLiveSourceUpdate = async (data: any, setLiveSourceAtom: SetterOrUpdater<any[]>) => {
    switch (data.event) {
        case api.wsEvents.LiveSource.list_update:
            await list.live.getAllSources().then((liveSourceData: any) => {
                Notification({
                    typeMessage: 'Live sources updated',
                    message: (
                        <div>
                            <p>Live Source updated</p>
                            <p> {data.data.msg} </p>
                        </div>
                    ),
                });
                setLiveSourceAtom(current => liveSourceData);
            });

            break;
    }
};

export default () => {
    const setLiveSourceAtom = useSetRecoilState(liveSourceAtom);

    React.useEffect(() => {
        const loadLiveSources = async (): Promise<void> => {
            const all = await list.live.getAllSources();
            setLiveSourceAtom(all);
        };
        loadLiveSources();
    }, []);

    const wsClient = list.wsClient;

    const onLiveSourceUpdate = React.useCallback(
        data => handleLiveSourceUpdate(data, setLiveSourceAtom),
        [setLiveSourceAtom]
    );

    React.useEffect(() => {
        if (wsClient === (null || undefined)) {
            return;
        }

        wsClient.on('message', onLiveSourceUpdate);

        return () => {
            wsClient.off('message', onLiveSourceUpdate);
        };
    }, [handleLiveSourceUpdate, wsClient]);
};
