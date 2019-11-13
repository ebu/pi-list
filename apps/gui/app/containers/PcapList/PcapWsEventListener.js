import { useEffect, useContext } from 'react';
import { StateContext } from './Context';
import Actions from './Actions';
import websocket from '../../utils/websocket';
import websocketEventsEnum from '../../enums/websocketEventsEnum';

const PcapWsEventListener = (props) => {

    const [state, dispatch] = useContext(StateContext);

    const onReceived = (data) => {
        dispatch({ type: Actions.pcapReceived, data });
    };

    const onPcapProcessed = (data) => {
        dispatch({ type: Actions.pcapProcessed, data });
    };

    const onPcapFailed = (data) => {
        dispatch({ type: Actions.pcapFailed, data });
    };

    const onDone = (data) => {
        dispatch({ type: Actions.pcapDone, data });
    };

    const onDeleted = (data) => {
        dispatch({ type: Actions.pcapDeleted, data });
    };

    const onZipFailed = (data) => {
        dispatch({ type: Actions.zipFileFailed, data });
    }

    const onZipComplete = (data) => {
        dispatch({ type: Actions.zipFileComplete, data });
    }

    useEffect(() => {
        websocket.on(websocketEventsEnum.PCAP.FILE_RECEIVED, onReceived);
        websocket.on(websocketEventsEnum.PCAP.FILE_PROCESSED, onPcapProcessed);
        websocket.on(websocketEventsEnum.PCAP.ANALYZING, onPcapProcessed);
        websocket.on(websocketEventsEnum.PCAP.FILE_FAILED, onPcapFailed);
        websocket.on(websocketEventsEnum.PCAP.DONE, onDone);
        websocket.on(websocketEventsEnum.PCAP.DELETED, onDeleted);
        websocket.on(websocketEventsEnum.ZIP.FILE_FAILED, onZipFailed);
        websocket.on(websocketEventsEnum.ZIP.FILE_COMPLETE, onZipComplete);

        return () => {
            websocket.off(websocketEventsEnum.PCAP.FILE_RECEIVED, onReceived);
            websocket.off(websocketEventsEnum.PCAP.FILE_PROCESSED, onPcapProcessed);
            websocket.off(websocketEventsEnum.PCAP.ANALYZING, onPcapProcessed);
            websocket.off(websocketEventsEnum.PCAP.FILE_FAILED, onPcapFailed);
            websocket.off(websocketEventsEnum.PCAP.DONE, onDone);
            websocket.off(websocketEventsEnum.PCAP.DELETED, onDeleted);
            websocket.off(websocketEventsEnum.ZIP.FILE_FAILED);
            websocket.off(websocketEventsEnum.ZIP.FILE_COMPLETE);
        };
    }, []);

    return props.children;
};

export default PcapWsEventListener;
