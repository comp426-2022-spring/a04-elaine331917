"use strict"
const database = require('better-sqlite3')

const logdb = new database('log.db')

const stmt = logdb.prepare(`SELECT name FROM sqlite_master WHERE type='table' and name='accesslog';`)
let row = stmt.get()
if (row === undefined) {
    console.log('Your database appears to be empty. I will initialize it now.')
    
    const sqlInit = `
        CREATE TABLE accesslog ( 
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
    console.log('Your database has been initialized with a new table.')
} else {
    console.log('Database exists.')
}

module.exports = logdb