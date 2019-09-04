// --- MODULE IMPORTS ---
// Import logging modules
const createError = require('http-errors')
const logger = require('morgan')

// Import express modules
const express = require('express')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')

// Import system modules
const path = require('path')

// Save root directory as global
global.rootPath = __dirname

// --- APP IMPORTS ---
// Import routers
const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')
const apiRouter = require('./routes/api')

// Create app
const app = express()

// View engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// Setup middleware
app.use(helmet())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public', 'web')))
app.use('/static', express.static(process.env.STATIC_DIR))

// Use routers
app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/api/v1', apiRouter)

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
})

// Error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
