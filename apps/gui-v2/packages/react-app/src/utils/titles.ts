export function getTitleFor(stream: any, index: any) {
    switch (stream.media_type) {
        case 'video':
            return `ST 2110-20 Video #${index + 1}`;
        case 'audio':
            return `ST 2110-30 Audio #${index + 1}`;
        case 'ancillary_data':
            return `ST 2110-40 Ancillary Data #${index + 1}`;
        case 'ttml':
            return `TTML #${index + 1}`;
        case 'unknown':
            return `Unknown #${index + 1}`;

        default:
            return null;
    }
}