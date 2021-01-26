import axios from 'axios';
import { Client } from '@ebulist/auth';

function loadFile(filePath) {
    let result = null;
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.open('GET', filePath, false);
    xmlhttp.send();
    if (xmlhttp.status === 200) {
        result = xmlhttp.responseText;
    }
    return result;
}

function getAPIPort() {
    let restAPIPort;

    try {
        const staticConfig = JSON.parse(loadFile('/static.config.json'));
        restAPIPort = staticConfig.publicApiPort;
    } catch (err) {
        restAPIPort = '3030';
    }

    return restAPIPort;
}

const REST_URL = `${window.location.protocol}//${window.location.hostname}:${getAPIPort()}`;
const API_URL = `${REST_URL}/api`;

/* End Session logic */

let client = null;

const getAuthUrl = path => {
    const url = new URL(path);

    if (client.isAuthenticated()) {
        const token = client.getToken();
        url.searchParams.append('token', `Bearer ${token}`);
    }

    return url;
};

const request = {
    get: url => axios.get(`${API_URL}/${url}`).then(response => response.data),
    put: (url, data, config = null) => axios.put(`${API_URL}/${url}`, data, config),
    post: (url, data) => axios.post(`${API_URL}/${url}`, data),
    patch: (url, data, config = null) => axios.patch(`${API_URL}/${url}`, data, config),
    delete: (url, data) => axios.delete(`${API_URL}/${url}`, data),
    httpRedirect: url => `${REST_URL}/${url}`,
};

export const WS_SERVER_URL = REST_URL;

const api = {
    /* Options */
    getSDPAvailableOptions: () => request.get('sdp/available-options'),
    getAvailableVideoOptions: () => request.get('sdp/available-options?media_type=video'),
    getAvailableAudioOptions: () => request.get('sdp/available-options?media_type=audio'),
    getAvailableAncillaryOptions: () => request.get('sdp/available-options?media_type=ancillary'),
    getFeatures: () => request.get('meta/features'),
    getVersion: () => request.get('meta/version'),

    /* Auth */
    getUser: () => request.get('user'),
    updateUserPreferences: value => request.patch('user/preferences', { value }),
    deleteUser: data => request.post('user/delete', data).then(client.logout(), request.httpRedirect('/login')),

    register: loginData => axios.post(`${REST_URL}/user/register`, loginData).then(response => response.data),

    login: data => axios.post(`${REST_URL}/auth/login`, data).then(response => response.data),
    revalidateToken: () => {
        return axios.get(`${API_URL}/user/revalidate-token`).then(response => response.data);
    },

    logout: data => {
        axios.post('auth/logout', data).then(client.logout(), request.httpRedirect('/login'));
    },

    /* EULA */
    acceptGDPR: data => request.post('user/gdpr', data),
    getGDPRStatus: () => request.get('user/gdpr'),

    /* News feed */
    getNews: () => request.get('news'),
    getHTML: urls => request.post('news/html', urls),
    setNewsRead: timestamp => request.post('news/markread', timestamp),

    /* PCAP */
    getPcaps: () => request.get('pcap'),
    getPcap: pcapID => request.get(`pcap/${pcapID}`),
    downloadOriginalCapture: pcapID =>
        axios.request({ url: `${API_URL}/pcap/${pcapID}/download_original`, method: 'GET', responseType: 'blob' }),
    downloadPcap: pcapID =>
        axios.request({ url: `${API_URL}/pcap/${pcapID}/download`, method: 'GET', responseType: 'blob' }),

    deletePcap: pcapID => request.delete(`pcap/${pcapID}`),
    getStreamsFromPcap: pcapID => request.get(`pcap/${pcapID}/streams`),
    updatePcapAnalysis: (pcapId, onAnalysisProgress) => {
        const config = {
            onAnalysisProgress: progressEvent => {
                const percentCompleted = Math.floor((progressEvent.loaded * 100) / progressEvent.total);

                onAnalysisProgress(percentCompleted);
            },
        };
        return request.patch(`pcap/${pcapId}`, null, config);
    },
    sendPcapFile: (pcapFile, onUploadProgress) => {
        const data = new FormData();
        data.append('pcap', pcapFile);

        const config = {
            onUploadProgress: progressEvent => {
                const percentCompleted = Math.floor((progressEvent.loaded * 100) / progressEvent.total);

                onUploadProgress(percentCompleted);
            },
        };

        return request.put('pcap', data, config);
    },

    /* SDP and reports */
    downloadSDP: pcapID => axios.request({ url: `${API_URL}/pcap/${pcapID}/sdp`, method: 'GET', responseType: 'blob' }),
    downloadJson: pcapID =>
        axios.request({ url: `${API_URL}/pcap/${pcapID}/report?type=json`, method: 'GET', responseType: 'blob' }),
    downloadPdf: pcapID =>
        axios.request({ url: `${API_URL}/pcap/${pcapID}/report?type=pdf`, method: 'GET', responseType: 'blob' }),

    uploadSDP: (sdpFile, onUploadComplete) => {
        const data = new FormData();
        data.append('sdp', sdpFile);

        const config = {
            onUploadComplete: progressEvent => onUploadComplete(progressEvent),
        };
        return request.put('sdp', data, config);
    },
    sdpToSource: (sdpFile, onUploadComplete) => {
        const data = new FormData();
        data.append('sdp', sdpFile);

        const config = {
            onUploadComplete: progressEvent => onUploadComplete(progressEvent),
        };
        return request.put('sdp/to_source', data, config);
    },

    getPtpOffset: pcapID => request.get(`pcap/${pcapID}/analytics/PtpOffset`),

    /* Stream */
    getCInstHistogramForStream: (pcapID, streamID) =>
        request.get(`pcap/${pcapID}/stream/${streamID}/analytics/CInst/histogram`),
    getCInstForStream: (pcapID, streamID, fromNs, toNs) =>
        request.get(`pcap/${pcapID}/stream/${streamID}/analytics/CInst?from=${fromNs}&to=${toNs}`),
    getCInstRaw: (pcapID, streamID, fromNs, toNs) =>
        request.get(`pcap/${pcapID}/stream/${streamID}/analytics/CInstRaw?from=${fromNs}&to=${toNs}`),
    getVrxHistogramForStream: (pcapID, streamID) =>
        request.get(`pcap/${pcapID}/stream/${streamID}/analytics/Vrx/histogram`),
    getVrxIdealForStream: (pcapID, streamID, fromNs, toNs, groupByNanoseconds) => {
        const groupBy = groupByNanoseconds ? `&groupByNanoseconds=${groupByNanoseconds}` : '';
        return request.get(`pcap/${pcapID}/stream/${streamID}/analytics/VrxIdeal?from=${fromNs}&to=${toNs}${groupBy}`);
    },
    getVrxIdealRaw: (pcapID, streamID, fromNs, toNs) =>
        request.get(`pcap/${pcapID}/stream/${streamID}/analytics/VrxIdealRaw?from=${fromNs}&to=${toNs}`),
    getDeltaToIdealTpr0Raw: (pcapID, streamID, fromNs, toNs) =>
        request.get(`pcap/${pcapID}/stream/${streamID}/analytics/DeltaToIdealTpr0Raw?from=${fromNs}&to=${toNs}`),

    /* RTP */
    getDeltaRtpTsVsPacketTsRaw: (pcapID, streamID, fromNs, toNs) =>
        request.get(`pcap/${pcapID}/stream/${streamID}/analytics/DeltaRtpTsVsPacketTsRaw?from=${fromNs}&to=${toNs}`),
    getDeltaPacketTimeVsRtpTimeRaw: (pcapID, streamID, fromNs, toNs) =>
        request.get(
            `pcap/${pcapID}/stream/${streamID}/analytics/DeltaPacketTimeVsRtpTimeRaw?from=${fromNs}&to=${toNs}`
        ),
    getDeltaToPreviousRtpTsRaw: (pcapID, streamID, fromNs, toNs) =>
        request.get(`pcap/${pcapID}/stream/${streamID}/analytics/DeltaToPreviousRtpTsRaw?from=${fromNs}&to=${toNs}`),
    getDeltaToPreviousRtpTsMinMax: (pcapID, streamID, fromNs, toNs) =>
        request.get(`pcap/${pcapID}/stream/${streamID}/analytics/DeltaToPreviousRtpTsMinMax?from=${fromNs}&to=${toNs}`),
    getDeltaRtpVsNtRaw: (pcapID, streamID, fromNs, toNs) =>
        request.get(`pcap/${pcapID}/stream/${streamID}/analytics/DeltaRtpVsNt?from=${fromNs}&to=${toNs}`),
    getPacketsPerFrame: (pcapID, streamID, fromNs, toNs) =>
        request.get(`pcap/${pcapID}/stream/${streamID}/analytics/packetsPerFrame?from=${fromNs}&to=${toNs}`),
    getAudioPktTsVsRtpTs: (pcapID, streamID, fromNs, toNs) =>
        request.get(`pcap/${pcapID}/stream/${streamID}/analytics/AudioPktTsVsRtpTs?from=${fromNs}&to=${toNs}`),
    getAudioTimeStampedDelayFactor: (pcapID, streamID, fromNs, toNs, toleranceUs, tsdfmaxUs) =>
        request.get(
            `pcap/${pcapID}/stream/${streamID}/analytics/AudioTimeStampedDelayFactor?from=${fromNs}&to=${toNs}&tolerance=${toleranceUs}&tsdfmax=${tsdfmaxUs}`
        ),

    getStreamInformation: (pcapID, streamID) => request.get(`pcap/${pcapID}/stream/${streamID}`),
    getStreamHelp: (pcapID, streamID) => request.get(`pcap/${pcapID}/stream/${streamID}/help`),
    sendStreamConfigurations: (pcapID, streamID, streamsConfigurations) =>
        request.put(`pcap/${pcapID}/stream/${streamID}/help`, streamsConfigurations),
    changeStreamName: (pcapID, streamID, data) => request.patch(`pcap/${pcapID}/stream/${streamID}/`, data),

    /* Video */
    getFramesFromStream: (pcapID, streamID) => request.get(`pcap/${pcapID}/stream/${streamID}/frames`),
    getPacketsFromFrame: (pcapID, streamID, frameNumber) =>
        request.get(`pcap/${pcapID}/stream/${streamID}/frame/${frameNumber}/packets`),

    /* Audio */
    renderMp3: (pcapID, streamID, channelsString) =>
        request.get(`pcap/${pcapID}/stream/${streamID}/rendermp3?channels=${channelsString}`),

    /* Ancillary */
    downloadAncillaryUrl: (pcapID, streamID, filename) => `pcap/${pcapID}/stream/${streamID}/ancillary/${filename}`,
    getAncillaryPktPerFrameHistogram: (pcapID, streamID) =>
        request.get(`pcap/${pcapID}/stream/${streamID}/analytics/AncillaryPktHistogram`),

    /* Txt files */
    downloadText: path => request.get(`${path}`),

    /* Live */
    getLiveStreams: () => request.get('live/streams/'),
    getLiveStream: streamID => request.get(`live/streams/${streamID}`),
    deleteLiveStream: streamID => request.delete(`live/streams/${streamID}`),
    changeLiveStreamName: (streamID, data) => request.patch(`live/streams/${streamID}/`, data),
    subscribeLiveStream: data => request.put('live/streams/subscribe/', data),
    getLiveSources: () => request.get('live/sources/'),
    addLiveSource: source => request.post('live/sources', { source }),
    deleteLiveSources: ids => request.put('live/sources/delete', { ids }),

    /* Workflow */
    createWorkflow: info => request.post('workflow', info),
    cancelWorkflow: info => request.put('workflow', info),
    getWorkflows: () => request.get('workflow'),

    /* Stream Comparisons */
    getComparisons: () => request.get('comparisons'),
    getComparison: comparisonID => request.get(`comparisons/${comparisonID}`),
    deleteComparison: comparisonID => request.delete(`comparisons/${comparisonID}`),
    postComparison: (comparisonID, data) => request.post(`comparisons/${comparisonID}`, data),

    /* Profiles */
    analysisProfile: {
        getInfo: () => request.get('analysis_profile'),
        setDefaultProfile: id => request.put('analysis_profile/default', { id: id }),
    },

    /* Download Manager */
    getDownloads: () => request.get('downloadmngr'),
    downloadFile: id =>
        axios.request({ url: `${API_URL}/downloadmngr/download/${id}`, method: 'GET', responseType: 'blob' }),

    // URLs
    getImageFromStream: (pcapID, streamID, timestamp) =>
        getAuthUrl(`${API_URL}/pcap/${pcapID}/stream/${streamID}/frame/${timestamp}/png`),

    getThumbnailFromStream: (pcapID, streamID, timestamp) =>
        getAuthUrl(`${API_URL}/pcap/${pcapID}/stream/${streamID}/frame/${timestamp}/jpg`),

    downloadMp3Url: (pcapID, streamID, channelsString) =>
        getAuthUrl(
            `${API_URL}/pcap/${pcapID}/stream/${streamID}/downloadmp3${
                channelsString ? `?channels=${channelsString}` : ''
            }`
        ),
};

const apiHandler = {
    login: data => api.login(data),
    revalidateToken: () => api.revalidateToken(),
};

const localStorageHandler = {
    setItem: (key, value) => localStorage.setItem(key, value),
    getItem: key => localStorage.getItem(key),
    removeItem: key => localStorage.removeItem(key),
};

client = new Client(apiHandler, localStorageHandler);

axios.interceptors.response.use(
    config => config,
    error => {
        if (
            !error.response ||
            (error.response.status > 400 && error.response.status < 500 && window.location.pathname !== '/login')
        ) {
            if (window.appHistory) {
                window.appHistory.push('/login');
            }
        }

        return Promise.reject(error);
    }
);

axios.interceptors.request.use(
    config => {
        const newConfig = config;

        if (client.isAuthenticated()) {
            const token = client.getToken();
            newConfig.headers.Authorization = `Bearer ${token}`;
        }

        return newConfig;
    },
    err => Promise.reject(err)
);

axios.defaults.withCredentials = true;

// Call revalidate so that, if we have a valid token in local storage, it can be used
client.revalidate();

export { client };
export default api;
