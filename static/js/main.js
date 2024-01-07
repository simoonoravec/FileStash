/**
 * Converts file size to a human readable string
 * @param {number} size Size in KB
 * @returns String
 */
function humanReadableSize(size_kb) {
    if (size_kb < 1000) {
        return size_kb + "KB";
    }

    if (size_kb >= 1000000) {
        return Math.round(size_kb / 1000000 * 10) / 10 + "GB";
    }

    if (size_kb >= 1000) {
        return Math.round(size_kb / 1000 * 10) / 10 + "MB";
    }
}