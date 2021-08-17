const express = require('express')
const bodyParser = require('body-parser')
var winston = require('./config/winston')
var morgan = require('morgan')
var cors = require('cors')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')

const reviewRoutes = require('./routes/reviewRoutes')
const authorRoutes = require('./routes/authorRoutes')
const mongo = require('./utils/mongo')

const app = express()
const port = process.env.PORT || 3000

// ====== Connect Mongo ========
mongo.connectToServer()

// ====== Connect morgan HTTP logger to winston
app.use(morgan('combined', { stream: winston.stream }))
app.use(cookieParser())

// ======== CORS Policy =======
const whitelist = [
  'http://127.0.0.1:3001',
  'http://localhost:3001',
  'http://localhost:3000',
  'http://127.0.0.1:3002',
  'http://localhost:3002',
  'http://127.0.0.1',
  'http://localhost',
  'http://client',
  'http://peerview.bloxberg.org/',
  'https://peerview.bloxberg.org/',
] // client as Docker service name instead of localhost.
const corsOptions = {
  origin: function (origin, callback) {
    if (
      whitelist.indexOf(origin) !== -1 || // Allow if origin found in whitelist
      !origin
    ) {
      // or a REST tool (postman) is being used or same origin.
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS ' + origin))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
}

// Apply CORS policy
app.all('*', cors(corsOptions), function (req, res, next) {
  next()
})

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }))

// parse application/json
app.use(express.json())

app.use('/api/reviews', reviewRoutes)
app.use('/api/authors', authorRoutes)

app.post('/setcookie', function (req, res) {
  let address = req.body.addressForToken
  const token = jwt.sign(
    {
      address: address,
    },
    process.env.JWT_KEY,
    {
      expiresIn: '1h',
    },
  )
  res
    .status(202)
    .cookie('jwt', token, {
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
      expires: new Date(new Date().getTime() + 500 * 1000),
    })
    .send('Cookies added')
})

app.listen(port, () => {
  winston.info('Express Listening at http://localhost:' + port)
})

winston.info('Running indexer:')
require('./indexer/index') // Run the indexer

module.exports = app // For testing
