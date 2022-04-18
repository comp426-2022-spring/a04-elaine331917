"use strict"
const database = require('better-sqlite3')

const logdb = new database('log.db')

const stmt = logdb.prepare(`SELECT name FROM sqlite_master WHERE type='table' and 'access';`)
let row = stmt.get()
if (row === undefined) {
    console.log('Log database appears to be empty. Creating log database...')
    
    const sqlInit = `
        CREATE TABLE access ( 
            id INTEGER PRIMARY KEY,
            remoteaddr TEXT,
            remoteuser TEXT,
            time INTEGER,
            method TEXT,
            url TEXT,
            protocol TEXT,
            httpversion TEXT, 
            secure TEXT,
            status INTEGER,
            referer TEXT,
            useragent TEXT
        )

    `
    
    logdb.exec(sqlInit)
    console.log('Database has been initialized with a new table and two entries')
} else {
    console.log('Log database exists.')
}

module.exports = logdb