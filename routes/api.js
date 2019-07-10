const express = require('express')
const fileUpload = require('express-fileupload')

const mongoose = require('mongoose')
const Content = require('../models/Content')
const Target = require('../models/Target')
const Collection = require('../models/Collection')
//const User = require('../models/User')

const path = require('path')

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
mongoose.connect('mongodb://localhost/test', { useNewUrlParser: true })
mongoose.connection.on('error', console.error.bind(console, 'connection error:'))
mongoose.connection.once('open', () => { console.log('mongoose connected') })

// ------------------------------------------------------//
// READ // GET
// ------------------------------------------------------//

router.get('/:version/content', (req, res, next) => {
  Content.find({}, req.query.select, (err, docs) => {
    if (err) return next(err)
    res.locals.docs = docs
    next()
  })
}, sendResult)

router.get('/:version/target', (req, res, next) => {
  Target.find({}, req.query.select, (err, docs) => {
    if (err) return next(err)
    res.locals.docs = docs
    next()
  })
}, sendResult)

router.get('/:version/target/contents', (req, res, next) => {
  Target
    .findOne({ name: req.query.name })
    .populate({
      path: 'collection',
      populate: { path: 'contents' }
    })
    .exec((err, target) => {
      if (err) return next(err)
      res.locals.docs = target.collection.contents
      next()
    })
}, sendResult)

function sendResult (req, res) {
  res.locals.docs.forEach(doc => {
    res.locals.json.push(doc.toJSON())
  })
  res.json(req.query.asObject ? { elements: res.locals.json } : res.locals.json)
}

// ------------------------------------------------------//
// CREATE // POST
// ------------------------------------------------------//

router.post('/:version/collection', (req, res, next) => {
  Collection.create({
    name: req.body.name,
    contents: req.body.contents
  },
  (err) => {
    if (err) return next(err)
    res.sendStatus(201)
  })
})

router.post('/:version/file', (req, res, next) => {
  if (!req || !req.files || !req.files.url) return next(new Error('Error: Files missing'))

  const file = req.files.url
  const type = file.mimetype.split('/')[0]
  const serverDir = path.join('.', 'public', 'ar', type, file.name)
  const publicDir = `http://${'localhost:3000'}/static/${type}/${file.name}`

  console.log('uploading...')

  file.mv(serverDir, (err) => {
    if (err) return next(err)

    console.log('uploaded')

    Content.create({
      desc: req.body.desc,
      enabled: true,
      order: req.body.order,
      type,
      url: publicDir
    },
    (err) => {
      if (err) return next(err)
      res.sendStatus(201)
    })
  })
})

// ------------------------------------------------------//
// UPDATE // PUT
// ------------------------------------------------------//

// Collection
// ----------
router.put('/:version/collection/:id', (req, res, next) => {
  const update = {
    name: req.body.name
  }
  purge(update)

  Collection.findByIdAndUpdate(req.params.id, update, (err) => {
    if (err) return next(err)
    res.sendStatus(201)
  })
})

// Content
// ----------
router.put('/:version/content/:id', (req, res, next) => {
  const update = {
    order: req.body.order,
    enabled: req.body.enabled,
    type: req.body.type,
    url: req.body.url,
    desc: req.body.string,
    addedBy: mongoose.Types.ObjectId(req.body.user),
    updateTime: Date.now()
  }
  purge(update)

  Content.findByIdAndUpdate(req.params.id, update, (err) => {
    if (err) return next(err)
    res.sendStatus(201)
  })
})

// Target
// ----------
router.put('/:version/target/:id', (req, res, next) => {
  const update = {
    name: req.body.name,
    collection: mongoose.Types.ObjectId(req.body.collection),
    updateTime: Date.now()
  }
  purge(update)

  Target.findByIdAndUpdate(req.params.id, update, (err) => {
    if (err) return next(err)
    res.sendStatus(201)
  })
})

// ------------------------------------------------------//
// DELETE // DELETE
// ------------------------------------------------------//

router.delete('/:version/:model', (req, res, next) => {
  Content.findByIdAndDelete(req.query._id, (err) => {
    if (err) return next(err)
    res.sendStatus(200)
  })
})

module.exports = router
