const config = require('../config');
const { log, logLevel } = require('./logger');
const db = require('./database');

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

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
 * @returns {String} ID
 */
function generateID() {
    if (config.id_generator == 'phoenic') {
        return _generateIDphoenic();
    }

    return _generateIDrandom();
}

/**
 * Generate a random string ID (a-z, A-Z, 0-9)
 * @returns {String} ID
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
 * @returns {String} ID
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
 * @returns {String}
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

/**
 * Check if file can be viewed in browser
 * @param {String} mime Mime type
 * @returns {Boolean}
 */
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

/**
 * Delete expired files
 * @returns {void}
 */
function oldFileCleanup() {
    if (config.delete_after < 1) {
        return;
    }

    const expired = Math.floor((Date.now() / 1000) - (config.delete_after * 3600));

    db.getDB().all("SELECT * FROM files WHERE upload_time < ?;", expired, function(err, res) {
        log(logLevel.DEBUG, `Deleting ${res.length} expired file(s)`);

        if (res.length > 0) {
            res.forEach(file => {
                fs.unlink(path.join(config.data_dir, file.real_filename), function(){});
            });
    
            db.getDB().prepare("DELETE FROM files WHERE upload_time < ?;").run(expired);
        }
    });
}

/**
 * Get human readable time until the deletion of a paste
 * @param {bigint} time_created Time when the paste was created in milliseconds
 * @returns String
 */
function getTimeUntilDeletion(time_created) {
    if (config.delete_after < 1) {
        return false;
    }

    try {
        const diffSeconds = time_created - Math.floor((Date.now() / 1000) - (config.delete_after * 3600));
        const diffMinutes = Math.round(diffSeconds / 60);

        if (diffMinutes < 5) {
            return '<5 minutes';
        }

        if (diffMinutes < 60) {
            return diffMinutes + ' minute' + (diffMinutes > 1 ? 's' : '');
        }

        const diffHours = Math.round(diffMinutes / 60);
        if (diffHours < 24) {
            return diffHours + ' hour' + (diffHours > 1 ? 's' : '');
        }

        const diffDays = Math.round(diffHours / 24);
        return diffDays + ' day' + (diffDays > 1 ? 's' : '');
    } catch {
        return false;
    }
}

module.exports = { generateID, initializeDataDir, humanReadableSize, isPreviewable, oldFileCleanup, getTimeUntilDeletion };