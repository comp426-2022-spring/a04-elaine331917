// define app with express
const express = require('express')
const app = express()

// require database and coin scripts
const db = require('./database.js')
const coin = require('./coin.js')

// make express use built-in body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const args = require('minimist')(process.argv.slice(2))
args['port', 'debug', 'log', 'help']

// print help message
const help = (`server.js [options]
    
    --port	Set the port number for the server to listen on. Must be an integer
                between 1 and 65535.
    
    --debug	If set to true, creates endlpoints /app/log/access/ which returns
                a JSON access log from the database and /app/error which throws 
                an error with the message "Error test successful." Defaults to 
                false.
    
    --log	If set to false, no log files are written. Defaults to true.
                Logs are always written to database.
    
    --help	Return this message and exit.`)

if (args.help || args.h) {
    console.log(help)
    process.exit(0)
}

// server port
const port = args.port || process.env.PORT || 5555
const server = app.listen(port, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%', port))
})

// log == true
if (args.log) {
    const morgan = require('morgan')
    const fs = require('fs')
    const logstream = fs.createWriteStream('access.log', {flags: 'a'})
    app.use(morgan('combined', { stream: logstream }))
}

// logging middleware
app.use((req, res, next) => {
    let logdata = {
        remoteaddr: req.ip,
        remoteuser: req.user,
        time: Date.now(),
        method: req.method,
        url: req.url,
        protocol: req.protocol,
        httpversion: req.httpVersion,
        status: res.statusCode,
        referer: req.headers['referer'],
        useragent: req.headers['user-agent']
    }

    const stmt = db.prepare('INSERT INTO accesslog ( remoteaddr, remoteuser, time, method, url, protocol, httpversion, secure, status, referer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    const info = stmt.run(logdata.remoteaddr, logdata.remoteuser, logdata.time, logdata.method, logdata.url, logdata.protocol, logdata.httpversion, logdata.secure, logdata.status, logdata.referer, logdata.useragent)
    res.status(200).json(info)
    next()
})

// API endpoints
app.get('/app/', (req, res) => {
    res.statusCode = 200
    res.statusMessage = 'OK'
    res.writeHead(res.statusCode, { 'Content-Type' : 'text/plain' })
    res.end(res.statusCode + ' ' + res.statusMessage)
})

app.get('/app/flip', (req, res) => {
    res.status(200).json({ 'flip': coin.coinFlip() })
})

app.get('/app/flips/:number', (req, res) => {
    const flips = coin.coinFlips(req.params.number)
    const sum = coin.countFlips(flips)
    res.status(200).json({ 'raw': flips, 'summary': sum })
})

app.get('/app/flip/call/heads', (req, res) => {
    const guess = coin.flipACoin('heads')
    res.status(200).json({ 'call': guess.call, 'flip': guess.flip, 'result': guess.result })
})

app.get('/app/flip/call/tails', (req, res) => {
    const guess = coin.flipACoin('tails')
    res.status(200).json({ 'call': guess.call, 'flip': guess.flip, 'result': guess.result })
})

// log and error testing
if (args.debug) {
    app.get('/app/log/access', (req, res) => {
        try {
            const stmt = db.prepare('SELECT * FROM accesslog').all()
            res.status(200).json(stmt)
        } catch {
            console.error(e)
        }
    })
    
    app.get('/app/error', (req, res) => {
        throw new Error('Error test successful.')
    })
}

app.use(function(req, res){
	res.json({"message":"Endpoint not found. (404)"});
    res.status(404);
});

process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Server stopped')
    })
})