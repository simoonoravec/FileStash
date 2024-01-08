require('dotenv').config();

global.app_version = require("./package.json").version;

const fs = require('fs');

if (!fs.existsSync(__dirname + '/config.js')) {
    console.error('Config file not found!');
    process.exit(1);
}

const config = require('./config');

//Validate config
if (
    !config.http_port
    || typeof config.http_port != 'number'
    || config.http_port % 1 != 0

    || !config.data_dir
    || config.data_dir.length == 0
    
    || !config.id_generator
    || !['random', 'phoenic'].includes(config.id_generator)

    || !config.id_bytes
    || typeof config.id_bytes != 'number'
    || config.id_bytes < 1
    || config.id_bytes % 1 != 0

    || !config.delete_after
    || typeof config.delete_after != 'number'
    || config.delete_after < 0
    || config.delete_after % 1 != 0

    || !config.public
    || typeof config.public != 'object'
    || !config.public.file_max_size
    || config.public.file_max_size < 1
    || config.public.file_max_size % 1 != 0
) {
    console.error('Invalid config file! (Missing or invalid variables)');
    process.exit(1);
} else {
    if (process.env.NODE_ENV == 'development') {
        console.log("Config validation OK.");
    }
}

const fileUpload = require('express-fileupload');
const { log, logLevel } = require('./app/logger');
const utils = require('./app/utils');

log(logLevel.INFO, `FileStash starting up...`);

/**
 * Initialize data directory
 */
log(logLevel.INFO, `Initializing data directory...`);
utils.initializeDataDir(logLevel.INFO);

/**
 * Initialize expired files cleanup
 */
if (config.delete_after > 0) {
    utils.oldFileCleanup();
    setInterval(utils.oldFileCleanup, 300000);
}

/**
 * Initialize Web server
 */
log(logLevel.INFO, `Initializing Web server (Express)`);
const express = require('express');
const webServer = express();

webServer.locals.CONFIG = config;

webServer.use(require('body-parser').urlencoded({ extended: true, limit: "100kb" }));
webServer.use(fileUpload({
    limits: { fileSize: (config.public.file_max_size + 500) * 1000 },
    useTempFiles : true,
    tempFileDir : './tmp'
}));
webServer.set('view engine', 'ejs');
webServer.use('/static', express.static('static'));

webServer.use(function(req, res, next) {
    log(logLevel.DEBUG, `[HTTP] Request form ${req.ip} at ${req.path}`);

    next();
});

webServer.use('/', require('./routes/main'));
webServer.use('/api', require('./routes/api'));

/* Catch all API URLs and show 404 */
webServer.all('/api/*', (req, res) => {
    res.json({code: 404, error: 'API not found or invalid method.'});
});

/* Catch all URLs and redirect to homepage */
webServer.all('*', (req, res) => {
    res.redirect('/');
});

/* Handle server errors in production mode (hide error details) */
if (process.env.NODE_ENV != 'development') {
    webServer.use((err, req, res, next) => {
        if (err) {
            res.sendStatus(500);
            return;
        }
         
        next();
    });
}

webServer.listen(config.http_port, () => {
    log(logLevel.INFO, `FileStash Web server listening on port ${config.http_port}`);
});

/**
 * Shutdown hook
 */
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

function shutdown() {
    webServer.close();
    require('./app/database').close(() => process.exit(0));
}