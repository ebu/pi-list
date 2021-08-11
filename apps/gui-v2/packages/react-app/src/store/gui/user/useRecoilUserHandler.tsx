import React from 'react';
import list from '../../../utils/api';
import { useRecoilState } from 'recoil';
import { userAtom } from './userInfo';

export default () => {
    const [userInfo, setUserInfo] = useRecoilState(userAtom);

    React.useEffect(() => {
        const loadUserInfo = async (): Promise<void> => {
            const all = await list.user.getInfo();
            setUserInfo(all);
        };
        loadUserInfo();
    }, []);

    //Reconnect websocket after refreshing browser
    const wsClient = list.wsClient;
    if (wsClient === (null || undefined) && userInfo) {
        list.reconnectWsClient(userInfo?.id);
    }
};
