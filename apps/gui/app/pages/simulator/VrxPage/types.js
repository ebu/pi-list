import PropTypes from 'prop-types';

export const schedule = {
    linear: 'linear',
    gapped: 'gapped',
};

export const events = { read: 'read', write: 'write' };

export const EventShape = PropTypes.shape({
    kind: PropTypes.oneOf([...Object.keys(events)]).isRequired,
    ts: PropTypes.number.isRequired,
    expectedSequenceNumber: PropTypes.number.isRequired, // Only if read. The expected SN.
    packet: PacketShape, // only if write
});

export const PacketShape = PropTypes.shape({
    packetTS: PropTypes.number.isRequired, // packet timestamp (nanoseconds)
    rtpTS: PropTypes.number.isRequired, // RTP timestamp (ticks)
    sequenceNumber: PropTypes.number.isRequired, // RTP sequence number
    marker: PropTypes.bool.isRequired, // RTP marker bit
});

export const FlowSettingsShape = PropTypes.shape({
    Tframe: PropTypes.number.isRequired, // The period of a frame (seconds)
    width: PropTypes.number.isRequired, // The width of a frame
    height: PropTypes.number.isRequired, // The height of a frame
    pgroupsPerPacket: PropTypes.number.isRequired, // The number of pgroups per packet
    interlaced: PropTypes.bool.isRequired, // true if interlaced, false otherwise
    schedule: PropTypes.oneOf([schedule.linear, schedule.gapped]).isRequired,
});

export const SenderSettingsShape = PropTypes.shape({
    packetJitterSigma: PropTypes.number, // Std deviation of the jitter, normalized to Trs
    trs: PropTypes.number, // Inter-packet gap, normalized to Trs
    tro: PropTypes.number, // First packet offset, normalized to Trs
});

export const FrameSettingsShape = PropTypes.shape({
    N: PropTypes.number.isRequired, // The frame number
    firstSN: PropTypes.number.isRequired, // The RTP sequence number of the first packet
});

export const ReadScheduleShape = PropTypes.shape({
    trs: PropTypes.number.isRequired, // The time between two consecutive packet reads (during the active period)
    tro: PropTypes.number.isRequired, // The time after N x TFrame at which the first packet will be read
});
