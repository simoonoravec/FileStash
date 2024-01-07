require('dotenv').config();

global.app_version = require("./package.json").version;

const fileUpload = require('express-fileupload');
const { log, logLevel } = require('./app/logger');
const utils = require('./app/utils');

const config = require("./config");

log(logLevel.INFO, `FileStash starting up...`);

/**
 * Initialize data directory
 */
log(logLevel.INFO, `Initializing data directory...`);
utils.initializeDataDir(logLevel.INFO);

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