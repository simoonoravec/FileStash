const config = require('../config');
const { log, logLevel } = require('./logger');

const fs = require('fs');
const crypto = require('crypto');

const { uniqueNamesGenerator, adjectives: UNGadjectives, colors: UNGcolors, animals: UNGanimals, names: UNGnames } = require('unique-names-generator');

/**
 * Check if data directory exists, create it otherwise.
 * Exit app if directory can't be created.
 * @param {int} logLevel 
 * @returns void | false
 */
function initializeDataDir(logLevel) {
    try {
        if (!fs.existsSync(config.data_dir)) {
            log(logLevel, 'Data directory doesn\'t exist, creating it.')
            fs.mkdirSync(config.data_dir);
        } else {
            if (!fs.statSync(config.data_dir).isDirectory()) {
                log(logLevel, 'Data directory is not a directory, recreating.')
                fs.unlink(config.data_dir, () => {
                    fs.mkdirSync(config.data_dir);
                });
            } else {
                log(logLevel, `Data directory found.`);
            }
        }
        return true;
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

/**
 * Generate an ID for a paste
 * @returns ID
 */
function generateID() {
    if (config.id_generator == 'phoenic') {
        return _generateIDphoenic();
    }

    return _generateIDrandom();
}

/**
 * Generate a random string ID (a-z, A-Z, 0-9)
 * @returns ID
 */
function _generateIDrandom() {
    let id = crypto.randomBytes(config.id_bytes).toString('hex');
    
    // This is probably unnecessary but it will make sure that you basically never run out of IDs
    let i = 1;
    while (fs.existsSync(config.data_dir + `/${id}.json`)) {
        id = crypto.randomBytes(config.id_bytes + i).toString('hex');
        i++;
    }

    return id;
}

/**
 * Generate a phoenic ID (example: stable-crimson-porpoise)
 * @returns ID
 */
function _generateIDphoenic() {
    const UNGconfig = {
        dictionaries: [UNGadjectives, UNGcolors, (Math.random() > Math.random() ? UNGanimals : UNGnames)],
        separator: '-',
        style: 'lowerCase'
    }

    let id = uniqueNamesGenerator(UNGconfig);

    // This is probably unnecessary but it will make sure that you basically never run out of IDs
    let i = 0;
    while (fs.existsSync(config.data_dir + `/${id}.json`)) {
        id = uniqueNamesGenerator(UNGconfig);

        i++;
        if (i == 5) {
            id = _generateIDrandom();
            break;
        }
    }

    return id;
}

/**
 * Converts file size to a human readable string
 * @param {number} size Size in KB
 * @returns String
 */
function humanReadableSize(size_kb) {
    if (size_kb < 1) {
        return "<1KB"
    }

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

function isPreviewable(mime) {
    const previewables = [
        "video/mp4",
        "text/plain",
        "application/json",
        "application/xhtml+xml",
        "application/x-javascript",
        "application/pdf",
    ];

    if (mime.startsWith('image/') || mime.startsWith('text/')) {
        return true;
    }

    return previewables.includes(mime);
}

module.exports = { generateID, initializeDataDir, humanReadableSize, isPreviewable };