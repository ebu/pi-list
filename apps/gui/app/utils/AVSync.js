import api from 'utils/api';
import { nsPerSec, usPerSec, msPerSec } from 'utils/constants';

/* config refers to comparison config */
export const getVideoFromConfig = (config) => config.main.media_type === 'video'? config.main : config.reference;
export const getAudioFromConfig = (config) => config.main.media_type === 'audio'? config.main : config.reference;

export const getAudioCursor = (mp3Duration, mp3CurrentTime, audioInfo) => {
    /* cursor time -> absolute time */
    const rawDuration = (audioInfo.last_packet_ts - audioInfo.first_packet_ts) / nsPerSec
        + audioInfo.packet_time / 1000;

    /* in case mp3 duration differs from raw */
    const mp3RawError = mp3Duration - rawDuration;
    const absTime = mp3CurrentTime - mp3RawError
        + (audioInfo.first_packet_ts / nsPerSec);

    // console.log(`mp3Duration - rawDuration = ${mp3Duration} - ${rawDuration} = ${mp3RawError}s`);
    // console.log(`mp3CurrentTime: ${mp3CurrentTime} s`);
    // console.log(`absTime: ${absTime} s`);

    /* compute RTP ts from pkt ts - deltaPktVsRtp */
    const margin_sec = audioInfo.packet_time / msPerSec / 2;

    return api.getAudioPktTsVsRtpTs(
        audioInfo.pcap,
        audioInfo.stream,
        (absTime - margin_sec) * nsPerSec,
        (absTime + margin_sec) * nsPerSec)
        .then(e => {
            const deltaPktVsRtp = (e.length > 0)?
                e[0].value / usPerSec : NaN; // e in us
            return {
                pktTs: absTime,
                rtpTs: absTime - deltaPktVsRtp,
                position: mp3CurrentTime / mp3Duration,
            };
        })
}

export const getVideoCursor = (frame, index, videoInfo) => {

    /* frame Ts is middle point between 1st and last pks ts */
    const absTime = (frame.first_packet_ts + frame.last_packet_ts) / nsPerSec / 2;

    /* compute RTP ts from pkt ts - deltaPktVsRtp
       deltaPktVsRtp which is logged at the begining of next frame */
    const margin_nsec = usPerSec;
    return api.getDeltaPacketTimeVsRtpTimeRaw(
        videoInfo.pcap,
        videoInfo.stream,
        frame.last_packet_ts,
        frame.last_packet_ts + margin_nsec)
    .then(e => {
        const deltaPktVsRtp = (e.length > 0)? e[0].value/nsPerSec : NaN; // e in ns
        return {
            pktTs: absTime,
            rtpTs: absTime - deltaPktVsRtp,
            position: index,
        };
    });
};

/* compute delay from audio and video cursors and post to server */
export const getAVDelay = (comparison, audioCursor, videoCursor, delay) => {
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
    if (delay === result.delay) {
        return;
    }

    // console.log(`Res:`);
    // console.log(result);

    api.postComparison(comparison.id, {
        id: comparison.id,
        _id: comparison._id,
        name: comparison.name,
        date: comparison.date,
        type: comparison.type,
        config: comparison.config,
        result: result,
    });

    /* return anyways */
    return result.delay;
};
