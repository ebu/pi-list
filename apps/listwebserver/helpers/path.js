function sanitizeDirectoryPath(path) {
    let sanitizedPath = path.replace(/\\/g, '/');

    if (sanitizedPath.charAt(sanitizedPath.length - 1) !== '/') {
        sanitizedPath = `${sanitizedPath}/` ;
    }

    return sanitizedPath;
}

module.exports = {
    sanitizeDirectoryPath
};
