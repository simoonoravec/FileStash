/**
 * Log level definitions
 */
const logLevel = {
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    NOTICE: 'NOTICE',
    WARNING: 'WARNING',
    ERROR: 'ERROR'
}

/**
 * 
 * @param {int} type Log level
 * @param {*} message Log message
 * @returns 
 */
function log(type, message) {
    if (type == logLevel.DEBUG && process.env.NODE_ENV != 'development') {
        return;
    }

    if (!type in logLevel) {
        return;
    }

    const time = new Date().toLocaleTimeString('eu');
    
    console.log(`[${time}][${type}]: ${message}`);
}

module.exports = {logLevel, log};