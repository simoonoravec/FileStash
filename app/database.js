const { log, logLevel } = require('../app/logger');
const sqlite = require('sqlite3');

/**
 * Initliaze the database
 */
const db = new sqlite.Database('./files.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  
  log(logLevel.DEBUG, "Connected to database!");

  db.exec(`CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_id TEXT,
    real_filename TEXT,
    original_name TEXT,
    size_kb INTEGER,
    mime TEXT,
    upload_time INTEGER,
    download_count INTEGER
  );`);
});

/**
 * Add file to database
 * @param {String} id File ID
 * @param {String} stored_filename Name of the file stored on disk
 * @param {String} name Original file name
 * @param {number} size_kb File size in KB
 * @param {String} mime File mimetype based on extension
 */
function addFile(id, stored_filename, name, size_kb, mime) {
    name = btoa(name);
    size_kb = Math.round(size_kb);

    const stmt = db.prepare(`
        INSERT INTO files(
            file_id,
            real_filename,
            original_name,
            size_kb,
            mime,
            upload_time,
            download_count
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?);`
    );

    const uploadTime = Math.round(Date.now() / 1000);

    stmt.run([
        id,
        stored_filename,
        name,
        size_kb,
        mime,
        uploadTime,
        0
    ]);
}

/**
 * Finds a file in the database by ID
 * @param {number} id File ID
 * @returns Promise
 */
function getFile(id) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM files WHERE file_id = ?;`, id, (err, res) => {
            if (err || !res) {
                reject();
            }
    
            resolve(res);
            return;
        });
    })
}

/**
 * Delete a file from database
 * @param {number} id File ID
 */
function deleteFileFromDB(id) {
    db.prepare("DELETE FROM files WHERE file_id = ?;").run(id);
}

/**
 * Returns the database connection
 * @returns {sqlite.Database} Database
 */
function getDB() {
    return db;
}

module.exports = { addFile, getFile, deleteFileFromDB, getDB };