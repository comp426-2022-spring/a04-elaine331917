import { coinFlip, coinFlips, countFlips, flipACoin } from "./modules/coin.mjs"
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const express = require('express')
const app = express()

const args = require('minimist')(process.argv.slice(2))
args['port']
const port = args.port || process.env.PORT || 5000

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
    res.status(200).json({ 'flip': coinFlip() })
})

app.get('/app/flips/:number', (req, res) => {
    const flips = coinFlips(req.params.number)
    const sum = countFlips(flips)
    res.status(200).json({ 'raw': flips, 'summary': sum })
})

app.get('/app/flip/call/heads', (req, res) => {
    const guess = flipACoin('heads')
    res.status(200).json({ 'call': guess.call, 'flip': guess.flip, 'result': guess.result })
})

app.get('/app/flip/call/tails', (req, res) => {
    const guess = flipACoin('tails')
    res.status(200).json({ 'call': guess.call, 'flip': guess.flip, 'result': guess.result })
})

app.use(function(req, res){
    res.status(404).send('404 NOT FOUND')
})