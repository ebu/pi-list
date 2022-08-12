export const cInst = (
    <span>
        <span>C</span>
        <span className="list-subscript">INST</span>
    </span>
);

export const cMax = (
    <span>
        <span>C</span>
        <span className="list-subscript">MAX</span>
    </span>
);

export const vrxFull = (
    <span>
        <span>VRX</span>
        <span className="list-subscript">FULL</span>
    </span>
);

export const tpa0 = (
    <span>
        TPA<span className="list-subscript">0</span>
    </span>
);

export const rtpTimestamp = (
    <span>
        RTP<span className="list-subscript">Timestamp</span>
    </span>
);
export const rtpTimestampEncoded = (
    <span>
        RTP<span className="list-subscript">Timestamp (encoded)</span>
    </span>
);

export const videoLatencyTitle = 'Video Latency';
export const videoLatencyDefinition = (
    <span>
        {tpa0} - {rtpTimestampEncoded}
    </span>
);

export const audioLatencyTitle = 'Audio Latency';
export const audioLatencyDefinition = <span>TPA - {rtpTimestampEncoded}</span>;

export const troDefault = (
    <span>
        TRO<span className="list-subscript">DEFAULT</span>
    </span>
);

export const timeCurrentFrame = (
    <span>
        T<span className="list-subscript">CF</span>
    </span>
);

export const trs = (
    <span>
        T<span className="list-subscript">RS</span>
    </span>
);

export const interFrameRtpTsTitle = <span>Inter-frame RTP TS Delta</span>;

export const interFrameRtpTsDefinition = (
    <span>
        <span className="list-nowrap">
            {rtpTimestamp} <span className="list-subscript">(CF)</span>
        </span>{' '}
        -{' '}
        <span className="list-nowrap">
            {rtpTimestamp} <span className="list-subscript">(CF-1)</span>
        </span>
    </span>
);

export const rtpOffset = (
    <span>
        RTP<span className="list-subscript">OFFSET</span>
    </span>
);

export const rtpOffsetDefinition = (
    <span>
        {rtpTimestampEncoded} - {timeCurrentFrame}
    </span>
);

export const fptDefinition = (
    <span>
        TPA<span className="list-subscript">0(CF)</span> - TCF
    </span>
);

export const gapDefinition = (
    <span>
        TPA<span className="list-subscript">0(CF)</span> - TPA
        <span className="list-subscript">Npackets - 1 (CF - 1)</span>
    </span>
);

export const pitTitle = 'Packet Interval Time';

export const pitDefinition = (
    <span>
        TPA<span className="list-subscript">j</span> - TPA
        <span className="list-subscript">j-1</span>
    </span>
);
