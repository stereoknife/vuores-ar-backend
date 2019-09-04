// Import express modules
const express = require('express')
const fileUpload = require('express-fileupload')

// Import other modules
const sharp = require('sharp') // Image manipulation
const path = require('path')

// Import mongoose modules
const mongoose = require('mongoose')

// Import APIs
const targetRoutes = require('./api/targetRoutes')
const galleryRoutes = require('./api/galleryRoutes')
const contentRoutes = require('./api/contentRoutes')
const fileRoutes = require('./api/fileRoutes')

const router = express.Router()

// Request parsers
router.use(express.json())
router.use(express.urlencoded({ extended: true }))
router.use(fileUpload({
  createParentPath: true,
  preserveExtension: true,
  useTempFiles: false
}))

// Connect to MongoDB
mongoose.connect(`mongodb://${process.env.MONGO_IP}`,
  {
    user: process.env.MONGO_USER,
    pass: process.env.MONGO_PASS,
    dbName: 'vuores',
    useNewUrlParser: true,
    autoReconnect: true,
    reconnectTries: 120,
    reconnectInterval: 1000
  }
)
  .then(() => { console.log('mongoose connected') })
  .catch(err => { console.log(err) })

// DEV ONLY
router.use('*', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE')
  next()
})

router.use(targetRoutes)
router.use(galleryRoutes)
router.use(contentRoutes)
router.use(fileRoutes)

module.exports = router
