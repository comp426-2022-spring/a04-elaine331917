// require coin module
const coin = require('./coin.js')
// define app with express
const express = require('express')
const app = express()

// require database script
const logdb = require('./database.js')

// make express use built-in body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const morgan = require('morgan')
const errorhandler = require('errorhandler')

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

if (args.debug) {
    app.get('/app/log/access', (req, res) => {
        try {
            const stmt = logdb.prepare('SELECT * FROM access').all()
            res.status(200).json(stmt)
        } catch {
            console.error(e)
        }
    })
    
    app.get('/app/error', (req, res) => {
        res.status(500)
        throw new Error('Error test completed successfully.')
    })
}



app.use(function(req, res){
    res.status(404).send('404 NOT FOUND')
})