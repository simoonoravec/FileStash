const express = require('express'),
    router = express.Router();

const path = require('path');

const config = require('../config');
const db = require('../app/database');
const utils = require('../app/utils');

/**
 * Home page
 */
router.get('/', (req, res) => {
    res.render('index');
});

/**
 * Download page
 */
router.get('/:id', (req, res) => {
    db.getFile(req.params.id).then((file) => {
        file.sizeHr = utils.humanReadableSize(file.size_kb);
        const previewable = utils.isPreviewable(file.mime);
        res.render('download', {file, previewable});
    }).catch((err) => {
        console.log("ERROR");
        res.end();
    });
});

/**
 * Download a file
 */
router.get('/:id/download', (req, res) => {
    db.getFile(req.params.id).then((file) => {
        res.download(path.join(config.data_dir, file.real_filename), atob(file.original_name));
    }).catch((err) => {
        res.send("404 Not Found");
    });
});

/**
 * View
 */
router.get('/:id/view', (req, res) => {
    db.getFile(req.params.id).then((file) => {
        if (!utils.isPreviewable(file.mime)) {
            res.send("This file type cannot be viewed.");
            return;
        }

        if (file.mime == "text/html") {
            file.mime = "text/plain";
        }

        res.set('Content-type', file.mime);
        res.sendFile(path.join(config.data_dir, file.real_filename));
    }).catch((err) => {
        res.send("404 Not Found");
    });
});

module.exports = router;