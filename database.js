const database = require('better-sqlite3')

const logdb = new database('log.db')

const stmt = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' and 'access';`)
let row = stmt.get()
if (row === undefined) {
    console.log('Log database appears to be empty. Creating log database...')
} else {
    console.log('Log database exists.')
}

module.exports = logdb