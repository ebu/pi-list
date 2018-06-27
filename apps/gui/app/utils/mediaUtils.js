export function getIcon(mediaType) {
    if (mediaType === 'unknown') {
        return 'help';
    } else if (mediaType === 'video') {
        return 'videocam';
    } else if (mediaType === 'audio') {
        return 'audiotrack';
    }

    return 'assignment';
}
