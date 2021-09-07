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

export const getVideoCursor = (frame: any, index: number, videoInfo: any) => {

    /* frame Ts is the beginning of the frame */
    const frameTsNs = frame.first_packet_ts / nsPerSec;
    const marginNs = 1000000;

    /* compute rtpTs = frameTs - deltaPktVsRtp(frameTs-margin, frameTs+margin)
       deltaPktVsRtp which is logged at the begining of next frame */
    return list.stream.getDeltaPacketTimeVsRtpTimeRaw(
        videoInfo.pcap,
        videoInfo.id,
        frame.last_packet_ts,
        frame.last_packet_ts + marginNs)
    .then(e => {
        const deltaPktVsRtp = (e.length > 0)? e[0].value/nsPerSec : NaN; // e in ns
        return {
            pktTs: frameTsNs,
            rtpTs: frameTsNs - deltaPktVsRtp,
            position: index,
        };
    });
};

export const getAudioCursor = (mp3Duration: number, mp3CurrentTime: number, audioInfo: any) => {
    /* cursor time -> absolute time */
    const rawDuration: number = (audioInfo.statistics.last_packet_ts - audioInfo.statistics.first_packet_ts) / nsPerSec
        + audioInfo.media_specific.packet_time / 1000;

    /* in case mp3 duration differs from raw */
    const mp3RawError: number = mp3Duration - rawDuration;
    const cursorTsS: number = mp3CurrentTime - mp3RawError
        + (audioInfo.statistics.first_packet_ts / nsPerSec);

    // console.log(`mp3Duration - rawDuration = ${mp3Duration} - ${rawDuration} = ${mp3RawError}s`);
    // console.log(`mp3CurrentTime: ${mp3CurrentTime} s`);
    // console.log(`cursorTsS: ${cursorTsS} s`);

    const marginNs: number = audioInfo.media_specific.packet_time * 1000000 / 100 * 60;
    /* compute rtpTs = pktTs - deltaPktVsRtp(pktTs-margin, pktTs+margin)
        with margin=60% of pkt_time, influxDB should always return at
        least 1 entry... but sometimes 2, better than nothing */
    return list.stream.getAudioPktTsVsRtpTsRaw(
        audioInfo.pcap,
        audioInfo.id,
        `${(cursorTsS*nsPerSec - marginNs)}`,
        `${(cursorTsS*nsPerSec + marginNs)}`)
        .then(e => {
            const deltaPktVsRtp = (e.length > 0)?
                e[0].value / usPerSec : NaN; // e in us
            return {
                pktTs: cursorTsS,
                rtpTs: cursorTsS - deltaPktVsRtp,
                position: mp3CurrentTime / mp3Duration,
            };
        })
}

/* compute delay from audio and video cursors and post to server */
export const getAVDelay = (comparison: any, audioCursor: any, videoCursor: any, delay: any) => {
    const result = {
        delay: {
            pkt: (audioCursor.pktTs - videoCursor.pktTs) * usPerSec, // convert sec to usec
            rtp: (audioCursor.rtpTs - videoCursor.rtpTs) * usPerSec,
            actual: (audioCursor.pktTs - videoCursor.pktTs) * usPerSec, // for comparison summary
        },
        audioCursor: audioCursor,
        videoCursor: videoCursor,
        transparency: false, /* compatibility with A2A and V2V */
    };

    if (delay !== result.delay) {
        list.streamComparison.postComparison(comparison.id, {
            id: comparison.id,
            _id: comparison._id,
            name: comparison.name,
            date: comparison.date,
            type: comparison.type,
            config: comparison.config,
            result: result,
        });
    }

    //console.log(`Delay result: ${JSON.stringify(result)}`);

    /* return anyways */
    return result.delay;
};
