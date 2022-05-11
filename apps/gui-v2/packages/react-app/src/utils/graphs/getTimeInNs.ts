export function getTimeInNs(time: string) {
    const date = new Date(time);

    return date.getTime() * 1000000;
}