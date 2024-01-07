module.exports = Object.freeze({
    'http_port': 3000,
    'data_dir': __dirname + '/data',

    // Defines how paste IDs are generated
    // 'random' = Random string of N characters (a-z, A-Z, 0-9) [example: 3830dc68]
    // 'phoenic' = Random combination of words [example: stable-crimson-porpoise]
    // There is a fallback system which generates a random ID when a phoenic ID already exists after 5 regenerations
    'id_generator': 'phoenic',

    // ID length, only applies for 'random' ID generator
    // 1 byte = 2 characters
    // (Even if unused, must remain valid because of config validation on startup)
    'id_bytes': 4,

    // Delete files after certain amount of hours since creation.
    // 0 = Disabled
    'delete_after': 72,

    // Config variables accessible by the client (browser)
    'public': {
        'file_max_size': 100000 //Maximum file size in KB (kilobytes)
    }
});