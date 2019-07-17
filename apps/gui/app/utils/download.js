export function downloadFiles(targets) {
    function download_next(i) {
        if (i >= targets.length) {
            return;
        }
        var a = document.createElement('a');
        a.href = targets[i].url;
        a.target = '_parent';
        // Use a.download if available, it prevents plugins from opening.
        if ('download' in a) {
            a.download = targets[i].filename;
        }
        // Add a to the doc for click to work.
        (document.body || document.documentElement).appendChild(a);
        a.click(); // The click method is supported by most browsers.
        // Delete the temporary link.
        a.parentNode.removeChild(a);
        // Download the next file with a small timeout. The timeout is necessary
        // for IE, which will otherwise only download the first file.
        setTimeout(function() {
            download_next(i + 1);
        }, 500);
    }
    // Initiate the first download.
    download_next(0);
}
