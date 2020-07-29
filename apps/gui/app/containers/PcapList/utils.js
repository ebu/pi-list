import immutable from '../../utils/immutable';
import pcapEnums from '../../enums/pcap';
import { translate } from '../../utils/translation';

import api from '../../utils/api';

function getFullInfoFromId(id, pcaps) {
    const filtered = pcaps.filter(pcap => pcap.id === id);
    return filtered.length > 0 ? filtered[0] : null;
}

function getTotalValidStreams(pcap) {
    return pcap.video_streams + pcap.audio_streams + pcap.anc_streams;
}

function isAnyStreamValid(pcap) {
    return getTotalValidStreams(pcap) > 0 || getPtpStateForPcapInfo(pcap);
}

function getStatusForPcapInfo(pcap) {
    if (pcap.progress && pcap.progress < 100) {
        return {
            state: pcapEnums.state.processing,
            progress: pcap.progress,
            stateLabel: pcap.stateLabel,
        };
    }

    if (pcap.error) {
        return {
            state: pcapEnums.state.failed,
        };
    }

    if (!pcap.analyzed || !isAnyStreamValid(pcap)) {
        return {
            state: pcapEnums.state.needs_user_input,
        };
    }

    if (pcap.total_streams === 0) {
        return {
            state: pcapEnums.state.no_analysis,
        };
    }

    if (pcap.summary === undefined) {
        // TODO: this is to deal with legacy
        return {
            state: pcapEnums.state.no_analysis,
        };
    }

    if (pcap.summary.error_list.length > 0) {
        return {
            state: pcapEnums.state.not_compliant,
        };
    }

    return {
        state: pcapEnums.state.compliant,
    };
}

function getPtpStateForPcapInfo(pcap) {
    return pcap.offset_from_ptp_clock !== 0; // Todo: add an alternative way of getting this information
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

const ExtractFileFromResponse = data => {
    const disposition = data.headers['content-disposition'];
    let fileName = '';
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const matches = filenameRegex.exec(disposition);
    if (matches != null && matches[1]) {
        fileName = matches[1].replace(/['"]/g, '');
    }
    const downloadUrl = window.URL.createObjectURL(new Blob([data.data]));
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
};

const DownloadOriginal = id => {
    return api
        .downloadOriginalCapture(id)
        .then(data => ExtractFileFromResponse(data))
        .catch(() => {});
};

const DownloadPcap = id => {
    return api
        .downloadPcap(id)
        .then(data => ExtractFileFromResponse(data))
        .catch(() => {});
};

const DownloadSDP = id => {
    return api
        .downloadSDP(id)
        .then(data => ExtractFileFromResponse(data))
        .catch(() => {});
};

const DownloadJson = id => {
    return api
        .downloadJson(id)
        .then(data => ExtractFileFromResponse(data))
        .catch(() => {});
};

const DownloadPdf = id => {
    return api
        .downloadPdf(id)
        .then(data => ExtractFileFromResponse(data))
        .catch(() => {});
};

export {
    getFullInfoFromId,
    addStateToPcapInfo,
    updatePcap,
    DownloadOriginal,
    DownloadPcap,
    DownloadSDP,
    DownloadJson,
    DownloadPdf,
};
