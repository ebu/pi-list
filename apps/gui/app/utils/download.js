function downloadFileFromUrl(url) {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_parent';
    // Add a to the doc for click to work.
    (document.body || document.documentElement).appendChild(a);
    // The click method is supported by most browsers.
    a.click();
    // Delete the temporary link.
    a.parentNode.removeChild(a);
    // Download the next file with a small timeout. The timeout is necessary
    // for IE, which will otherwise only download the first file.
    setTimeout(() => {}, 500);
}

export {
    downloadFileFromUrl
}
