import axios from 'axios';

const REST_URL = `http://${window.location.hostname}:3030`;
const API_URL = `${REST_URL}/api`;

axios.interceptors.response.use(config => config, (error) => {
    if (error.response.status === 401 && window.location.pathname !== '/login') {
        window.appHistory.push('/login');
    }

    return Promise.reject(error);
});

axios.defaults.withCredentials = true;

const request = {
    get: url => axios.get(`${API_URL}/${url}`).then(response => response.data),
    put: (url, data, config = null) => axios.put(`${API_URL}/${url}`, data, config),
    post: (url, data) => axios.post(`${API_URL}/${url}`, data),
    patch: (url, data) => axios.patch(`${API_URL}/${url}`, data),
    delete: url => axios.delete(`${API_URL}/${url}`)
};

export const WS_SERVER_URL = REST_URL;

export default {

    /* Options */
    getSDPAvailableOptions: () => request.get('sdp/available-options'),
    getAvailableVideoOptions: () => request.get('sdp/available-options?media_type=video'),
    getAvailableAudioOptions: () => request.get('sdp/available-options?media_type=audio'),
    getAvailableAncillaryOptions: () => request.get('sdp/available-options?media_type=ancillary'),
    getFeatures: () => request.get('features'),

    /* Auth */
    getUser: () => request.get('user'),
    deleteUser: () => request.delete('user'),

    register: loginData => axios.post(`${REST_URL}/user/register`, loginData).then(response => response.data),
    getToken: () => axios.get(`${REST_URL}/auth/token`).then(response => response.data),

    login: loginData => axios.post(`${REST_URL}/auth/login`, loginData).then(response => response.data),
    logout: () => `${REST_URL}/auth/logout`,

    /* PCAP */
    getPcaps: () => request.get('pcap'),
    getPcap: pcapID => request.get(`pcap/${pcapID}`),
    deletePcap: pcapID => request.delete(`pcap/${pcapID}`),
    downloadSDP: pcapID => `${API_URL}/pcap/${pcapID}/sdp`,
    getStreamsFromPcap: pcapID => request.get(`pcap/${pcapID}/streams`),
    sendPcapFile: (pcapFile, onUploadProgress) => {
        const data = new FormData();
        data.append('pcap', pcapFile);

        const config = {
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.floor((progressEvent.loaded * 100) / progressEvent.total);

                onUploadProgress(percentCompleted);
            }
        };

        return request.put('pcap', data, config);
    },

    getPtpOffset: pcapID => request.get(`pcap/${pcapID}/analytics/PtpOffset`),

    /* Stream */
    getCInstHistogramForStream: (pcapID, streamID, fromNs, toNs) =>
        request.get(`pcap/${pcapID}/stream/${streamID}/analytics/CInst/validation`),

    getCInstForStream: (pcapID, streamID, fromNs, toNs) =>
        request.get(`pcap/${pcapID}/stream/${streamID}/analytics/CInst?from=${fromNs}&to=${toNs}`),
    getCInstRaw: (pcapID, streamID, fromNs, toNs) =>
        request.get(`pcap/${pcapID}/stream/${streamID}/analytics/CInstRaw?from=${fromNs}&to=${toNs}`),
    getVrxIdealForStream: (pcapID, streamID, fromNs, toNs) =>
        request.get(`pcap/${pcapID}/stream/${streamID}/analytics/VrxIdeal?from=${fromNs}&to=${toNs}`),
    getVrxFirstPacketFirstFrameFromStream: (pcapID, streamID, fromNs, toNs) =>
        request.get(`pcap/${pcapID}/stream/${streamID}/analytics/VrxFirstPacketFirstFrame?from=${fromNs}&to=${toNs}`),
    getVrxFirstPacketEachFrame: (pcapID, streamID, fromNs, toNs) =>
        request.get(`pcap/${pcapID}/stream/${streamID}/analytics/VrxFirstPacketEachFrame?from=${fromNs}&to=${toNs}`),
    getVrxFirstPacketEachFrameRaw: (pcapID, streamID, fromNs, toNs) =>
        request.get(`pcap/${pcapID}/stream/${streamID}/analytics/VrxFirstPacketEachFrameRaw?from=${fromNs}&to=${toNs}`),
    getDeltaToIdealTpr0Raw: (pcapID, streamID, fromNs, toNs) =>
        request.get(`pcap/${pcapID}/stream/${streamID}/analytics/DeltaToIdealTpr0Raw?from=${fromNs}&to=${toNs}`),
    getDeltaRtpTsVsPacketTsRaw: (pcapID, streamID, fromNs, toNs) =>
        request.get(`pcap/${pcapID}/stream/${streamID}/analytics/DeltaRtpTsVsPacketTsRaw?from=${fromNs}&to=${toNs}`),
    getDeltaToPreviousRtpTsRaw: (pcapID, streamID, fromNs, toNs) =>
        request.get(`pcap/${pcapID}/stream/${streamID}/analytics/DeltaToPreviousRtpTsRaw?from=${fromNs}&to=${toNs}`),
    getDeltaRtpVsNtRaw: (pcapID, streamID, fromNs, toNs) =>
        request.get(`pcap/${pcapID}/stream/${streamID}/analytics/DeltaRtpVsNt?from=${fromNs}&to=${toNs}`),

    getStreamInformation: (pcapID, streamID) => request.get(`pcap/${pcapID}/stream/${streamID}`),
    getStreamHelp: (pcapID, streamID) => request.get(`pcap/${pcapID}/stream/${streamID}/help`),
    sendStreamConfigurations: (pcapID, streamID, streamsConfigurations) => request.put(`pcap/${pcapID}/stream/${streamID}/help`, streamsConfigurations),
    changeStreamName: (pcapID, streamID, data) => request.patch(`pcap/${pcapID}/stream/${streamID}/`, data),

    /* Video */
    getFramesFromStream: (pcapID, streamID) => request.get(`pcap/${pcapID}/stream/${streamID}/frames`),
    getImageFromStream: (pcapID, streamID, timestamp) =>
        `${API_URL}/pcap/${pcapID}/stream/${streamID}/frame/${timestamp}/png`,
    getPacketsFromFrame: (pcapID, streamID, frameNumber) => request
        .get(`pcap/${pcapID}/stream/${streamID}/frame/${frameNumber}/packets`),

    /* Audio */
    downloadMP3: (pcapID, streamID) => `${API_URL}/pcap/${pcapID}/stream/${streamID}/mp3`,

    /* Live */
    getLiveStreams: () => request.get('live/streams/'),
    getLiveStream: streamID => request.get(`live/streams/${streamID}`),
    deleteLiveStream: streamID => request.delete(`live/streams/${streamID}`),
    changeLiveStreamName: (streamID, data) => request.patch(`live/streams/${streamID}/`, data),
    subscribeLiveStream: data => request.put('live/streams/subscribe/', data)
};
