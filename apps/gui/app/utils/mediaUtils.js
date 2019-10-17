export function getIcon(mediaType) {
    if (mediaType === 'unknown') {
        return 'help';
    }
    if (mediaType === 'video') {
        return 'videocam';
    }
    if (mediaType === 'audio') {
        return 'audiotrack';
    }

    return 'assignment';
}
