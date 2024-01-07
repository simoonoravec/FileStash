const express = require('express'),
    router = express.Router();

const path = require('path');

const config = require('../config');
const db = require('../app/database');
const utils = require('../app/utils');
const fs = require('fs');

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

        let timeUntilDeletion = utils.getTimeUntilDeletion(file.upload_time);

        res.render('download', {file, previewable, timeUntilDeletion});
    }).catch((err) => {
        res.render('error', {error: "404 - File Not Found"});
    });
});

/**
 * Download a file
 */
router.get('/:id/download', (req, res) => {
    db.getFile(req.params.id).then((file) => {
        const fpath = path.join(config.data_dir, file.real_filename);

        if (!fs.existsSync(fpath)) {
            res.render('error', {error: "Well, this is strange... The entry exists in the database but the file wasn't found on the disk."});
            return;
        }

        res.download(fpath, atob(file.original_name));
    }).catch((err) => {
        res.render('error', {error: "404 - File Not Found"});
    });
});

/**
 * View
 */
router.get('/:id/view', (req, res) => {
    db.getFile(req.params.id).then((file) => {
        if (!utils.isPreviewable(file.mime)) {
            res.render('error', {error: "This file type cannot be viewed."});
            return;
        }

        if (file.mime == "text/html") {
            file.mime = "text/plain";
        }

        const fpath = path.join(config.data_dir, file.real_filename);
        if (!fs.existsSync(fpath)) {
            res.render('error', {error: "Well, this is strange... The entry exists in the database but the file wasn't found on the disk."});
            return;
        }

        res.set('Content-type', file.mime);
        res.sendFile(fpath);
    }).catch((err) => {
        res.render('error', {error: "404 - File Not Found"});
    });
});

module.exports = router;