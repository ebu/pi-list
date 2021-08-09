import list from '../../../../../utils/api';
const msPerSec = 1000;
const usPerSec = 1000000;
const nsPerSec = 1000000000;

/* config refers to comparison config */
export const getVideoFromConfig = (config: any, mainStreamInfo: any, referenceStreamInfo: any) =>
    config.main.media_type === 'video' ? mainStreamInfo : referenceStreamInfo;
export const getAudioFromConfig = (config: any, mainStreamInfo: any, referenceStreamInfo: any) =>
    config.main.media_type === 'audio' ? mainStreamInfo : referenceStreamInfo;

/* config refers to comparison config */
export const getPcapIdVideoFromConfig = (config: any) =>
    config.main.media_type === 'video' ? config.main.pcap : config.reference.pcap;
export const getPcapIdAudioFromConfig = (config: any) =>
    config.main.media_type === 'audio' ? config.main.pcap : config.reference.pcap;
