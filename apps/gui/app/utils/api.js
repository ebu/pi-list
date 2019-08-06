import axios from 'axios';

const REST_URL = `http://${window.location.hostname}:3030`;
const API_URL = `${REST_URL}/api`;

axios.interceptors.response.use(
    config => config,
    error => {
        if (
            error.response.status === 401 &&
            window.location.pathname !== '/login'
        ) {
            window.appHistory.push('/login');
        }

        return Promise.reject(error);
    }
);

axios.defaults.withCredentials = true;

const request = {
    get: url => axios.get(`${API_URL}/${url}`).then(response => response.data),
    put: (url, data, config = null) =>
        axios.put(`${API_URL}/${url}`, data, config),
    post: (url, data) => axios.post(`${API_URL}/${url}`, data),
    patch: (url, data) => axios.patch(`${API_URL}/${url}`, data),
    delete: (url, data) => axios.delete(`${API_URL}/${url}`, data),
};

export const WS_SERVER_URL = REST_URL;

export default {
    /* Options */
    getSDPAvailableOptions: () => request.get('sdp/available-options'),
    getAvailableVideoOptions: () =>
        request.get('sdp/available-options?media_type=video'),
    getAvailableAudioOptions: () =>
        request.get('sdp/available-options?media_type=audio'),
    getAvailableAncillaryOptions: () =>
        request.get('sdp/available-options?media_type=ancillary'),
    getFeatures: () => request.get('meta/features'),
    getVersion: () => request.get('meta/version'),

    /* Auth */
    getUser: () => request.get('user'),
    updateUserPreferences: value =>
        request.patch('user/preferences', { value }),
    deleteUser: () => request.delete('user'),

    register: loginData =>
        axios
            .post(`${REST_URL}/user/register`, loginData)
            .then(response => response.data),
    getToken: () =>
        axios.get(`${REST_URL}/auth/token`).then(response => response.data),

    login: loginData =>
        axios
            .post(`${REST_URL}/auth/login`, loginData)
            .then(response => response.data),
    logout: () => `${REST_URL}/auth/logout`,

    /* PCAP */
    getPcaps: () => request.get('pcap'),
    getPcap: pcapID => request.get(`pcap/${pcapID}`),
    downloadPcap: pcapID => request.get(`pcap/${pcapID}/download`),
    downloadPcapUrl: pcapID => `${API_URL}/pcap/${pcapID}/download`,
    deletePcap: pcapID => request.delete(`pcap/${pcapID}`),
    getStreamsFromPcap: pcapID => request.get(`pcap/${pcapID}/streams`),
    sendPcapFile: (pcapFile, onUploadProgress) => {
        const data = new FormData();
        data.append('pcap', pcapFile);

        const config = {
            onUploadProgress: progressEvent => {
                const percentCompleted = Math.floor(
                    (progressEvent.loaded * 100) / progressEvent.total
                );

                onUploadProgress(percentCompleted);
            },
        };

        return request.put('pcap', data, config);
    },

    /* SDP */
    downloadSDP: pcapID => request.get(`pcap/${pcapID}/sdp`),
    downloadSDPUrl: pcapID => `${API_URL}/pcap/${pcapID}/sdp`,
    downloadJsonUrl: pcapID => `${API_URL}/pcap/${pcapID}/report?type=json`,
    downloadPdfUrl: pcapID => `${API_URL}/pcap/${pcapID}/report?type=pdf`,
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
        request.get(
            `pcap/${pcapID}/stream/${streamID}/analytics/CInst/histogram`
        ),
    getCInstForStream: (pcapID, streamID, fromNs, toNs) =>
        request.get(
            `pcap/${pcapID}/stream/${streamID}/analytics/CInst?from=${fromNs}&to=${toNs}`
        ),
    getCInstRaw: (pcapID, streamID, fromNs, toNs) =>
        request.get(
            `pcap/${pcapID}/stream/${streamID}/analytics/CInstRaw?from=${fromNs}&to=${toNs}`
        ),
    getVrxHistogramForStream: (pcapID, streamID) =>
        request.get(
            `pcap/${pcapID}/stream/${streamID}/analytics/Vrx/histogram`
        ),
    getVrxIdealForStream: (pcapID, streamID, fromNs, toNs) =>
        request.get(
            `pcap/${pcapID}/stream/${streamID}/analytics/VrxIdeal?from=${fromNs}&to=${toNs}`
        ),
    getVrxIdealRaw: (pcapID, streamID, fromNs, toNs) =>
        request.get(
            `pcap/${pcapID}/stream/${streamID}/analytics/VrxIdealRaw?from=${fromNs}&to=${toNs}`
        ),
    getVrxAdjustedAvgTro: (pcapID, streamID, fromNs, toNs) =>
        request.get(
            `pcap/${pcapID}/stream/${streamID}/analytics/VrxAdjustedAvgTro?from=${fromNs}&to=${toNs}`
        ),
    getDeltaToIdealTpr0Raw: (pcapID, streamID, fromNs, toNs) =>
        request.get(
            `pcap/${pcapID}/stream/${streamID}/analytics/DeltaToIdealTpr0Raw?from=${fromNs}&to=${toNs}`
        ),
    getDeltaToIdealTpr0AdjustedAvgTroRaw: (pcapID, streamID, fromNs, toNs) =>
        request.get(
            `pcap/${pcapID}/stream/${streamID}/analytics/DeltaToIdealTpr0AdjustedAvgTroRaw?from=${fromNs}&to=${toNs}`
        ),
    getDeltaRtpTsVsPacketTsRaw: (pcapID, streamID, fromNs, toNs) =>
        request.get(
            `pcap/${pcapID}/stream/${streamID}/analytics/DeltaRtpTsVsPacketTsRaw?from=${fromNs}&to=${toNs}`
        ),
    getDeltaToPreviousRtpTsRaw: (pcapID, streamID, fromNs, toNs) =>
        request.get(
            `pcap/${pcapID}/stream/${streamID}/analytics/DeltaToPreviousRtpTsRaw?from=${fromNs}&to=${toNs}`
        ),
    getDeltaRtpVsNtRaw: (pcapID, streamID, fromNs, toNs) =>
        request.get(
            `pcap/${pcapID}/stream/${streamID}/analytics/DeltaRtpVsNt?from=${fromNs}&to=${toNs}`
        ),
    getAudioRtpTsVsPktTs: (pcapID, streamID, fromNs, toNs, low, high, min, max) =>
        request.get(
            `pcap/${pcapID}/stream/${streamID}/analytics/AudioRtpTsVsPktTs?from=${fromNs}&to=${toNs}&min=${min}&max=${max}`
        ),
    getAudioTimeStampedDelayFactor: (
        pcapID,
        streamID,
        fromNs,
        toNs,
        toleranceUs,
        tsdfmaxUs
    ) =>
        request.get(
            `pcap/${pcapID}/stream/${streamID}/analytics/AudioTimeStampedDelayFactor?from=${fromNs}&to=${toNs}&tolerance=${toleranceUs}&tsdfmax=${tsdfmaxUs}`
        ),

    getStreamInformation: (pcapID, streamID) =>
        request.get(`pcap/${pcapID}/stream/${streamID}`),
    getStreamHelp: (pcapID, streamID) =>
        request.get(`pcap/${pcapID}/stream/${streamID}/help`),
    sendStreamConfigurations: (pcapID, streamID, streamsConfigurations) =>
        request.put(
            `pcap/${pcapID}/stream/${streamID}/help`,
            streamsConfigurations
        ),
    changeStreamName: (pcapID, streamID, data) =>
        request.patch(`pcap/${pcapID}/stream/${streamID}/`, data),

    /* Video */
    getFramesFromStream: (pcapID, streamID) =>
        request.get(`pcap/${pcapID}/stream/${streamID}/frames`),
    getImageFromStream: (pcapID, streamID, timestamp) =>
        `${API_URL}/pcap/${pcapID}/stream/${streamID}/frame/${timestamp}/png`,
    getPacketsFromFrame: (pcapID, streamID, frameNumber) =>
        request.get(
            `pcap/${pcapID}/stream/${streamID}/frame/${frameNumber}/packets`
        ),

    /* Audio */
    downloadMp3Url: (pcapID, streamID, channelsString) =>
        `${API_URL}/pcap/${pcapID}/stream/${streamID}/downloadmp3` +
        (channelsString ? `?channels=${channelsString}` : ''),
    renderMp3: (pcapID, streamID, channelsString) =>
        request.get(
            `pcap/${pcapID}/stream/${streamID}/rendermp3?channels=${channelsString}`
        ),

    /* Live */
    getLiveStreams: () => request.get('live/streams/'),
    getLiveStream: streamID => request.get(`live/streams/${streamID}`),
    deleteLiveStream: streamID => request.delete(`live/streams/${streamID}`),
    changeLiveStreamName: (streamID, data) =>
        request.patch(`live/streams/${streamID}/`, data),
    subscribeLiveStream: data => request.put('live/streams/subscribe/', data),
    subscribePCAP: data => request.put('live/pcap/capture/', data),
    getLiveSources: () => request.get('live/sources/'),
    addLiveSource: source => request.post('live/sources', { source }),
    deleteLiveSources: ids => request.put('live/sources/delete', { ids }),

    createWorkflow: info => request.post('workflow', info),
    getWorkflows: () => request.get('workflow'),
};
