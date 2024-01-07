const config = require('../config');
const utils = require('../app/utils');
const db = require('../app/database');
const crypto = require('crypto');
const path = require('path');
const mime = require('mime');

const express = require('express'),
    router = express.Router();


/**
 * Upload a file
 */
router.post('/upload', (req, res) => {
    if (!req.files || Object.keys(req.files).length !== 1) {
        res.json({success: false, error: "No file supplied."});
        return;
    }

    const file = req.files.file;
    const size_kb = Math.round(file.size/1000);

    if (size_kb > config.public.file_max_size) {
        res.json({success: false, error: "File is too large!"});
        return;
    }

    const id = utils.generateID();
    const storedName = crypto.createHash('md5').update(id).digest('hex');

    file.mv(path.join(config.data_dir, storedName), function(err) {
        if (err) {
            res.json({success: false, error: "Internal error."});
            return;
        }

        db.addFile(id, storedName, file.name, size_kb, file.mimetype);
        res.json({success: true, id});
    });

});

module.exports = router;