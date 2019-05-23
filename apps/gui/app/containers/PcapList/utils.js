import React, { useReducer, useEffect, useContext } from 'react';
import immutable from '../../utils/immutable';
import notifications from '../../utils/notifications';
import { StateContext } from './Context';
import Actions from './Actions';
import PcapList from './PcapList';
import asyncLoader from '../../components/asyncLoader';
import api from '../../utils/api';
import pcapEnums from '../../enums/pcap';
import { translate } from '../../utils/translation';
import PcapWsEventListener from './PcapWsEventListener';

function getFullInfoFromId(id, pcaps) {
    const filtered = pcaps.filter(pcap => pcap.id === id);
    return filtered.length > 0 ? filtered[0] : null;
}

function getTotalValidStreams(pcap) {
    return pcap.video_streams + pcap.audio_streams + pcap.anc_streams;
}

function isAnyStreamValid(pcap) {
    return getTotalValidStreams(pcap) > 0;
}

function getStatusForPcapInfo(pcap) {
    if (pcap.progress && pcap.progress < 100) {
        return {
            state: pcapEnums.state.processing,
            progress: pcap.progress,
            stateLabel: pcap.stateLabel
        };
    }

    if (pcap.error) {
        return {
            state: pcapEnums.state.failed
        };

    }

    if (!pcap.analyzed || !isAnyStreamValid(pcap)) {
        return {
            state: pcapEnums.state.needs_user_input
        };

    }

    if (pcap.total_streams === 0) {
        return {
            state: pcapEnums.state.no_analysis
        };
    }

    if (pcap.summary === undefined) {
        // TODO: this is to deal with legacy
        return {
            state: pcapEnums.state.no_analysis
        };
    }

    if (pcap.summary.error_list.length > 0) {
        return {
            state: pcapEnums.state.not_compliant
        };
    }

    return {
        state: pcapEnums.state.compliant
    };
}

function getPtpStateForPcapInfo(pcap) {
    return (pcap.offset_from_ptp_clock !== 0); // Todo: add an alternative way of getting this information
}

function addStateToPcapInfo(pcap) {
    return {
        ...pcap,
        status: getStatusForPcapInfo(pcap),
        ptp: getPtpStateForPcapInfo(pcap),
    };
}

function updatePcap(pcaps, pcap, newStateLabel) {
    const info = addStateToPcapInfo(pcap);
    info.stateLabel = translate(newStateLabel);

    const newPcaps = immutable.findAndUpdateElementInArray({ id: pcap.id }, pcaps, info);

    return newPcaps;
}

export {
    getFullInfoFromId,
    addStateToPcapInfo,
    updatePcap
};
