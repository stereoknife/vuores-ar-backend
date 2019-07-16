const express = require('express')
const fileUpload = require('express-fileupload')

const mongoose = require('mongoose')
const Content = require('../models/Content')
const Target = require('../models/Target')
const Gallery = require('../models/Gallery')
// const User = require('../models/User')

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

router.get('*', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  next()
})

router.get('/:version/content', (req, res, next) => {
  Content.find(req.query.find || {}, req.query.select, (err, docs) => {
    if (err) return next(err)
    res.locals.docs = docs
    next()
  })
}, sendResult)

router.get('/:version/gallery', async (req, res, next) => {
  Gallery
    .find({})
    .select(req.query.select)
    .populate(req.query.populate)
    .exec()
    .then(docs => {
      console.log(docs)
      res.locals.docs = docs
      return next()
    })
    .catch(reason => { return next(new Error(reason)) })
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
      path: 'gallery',
      populate: { path: 'contents' }
    })
    .exec((err, target) => {
      if (err) return next(err)
      res.locals.docs = target.gallery.contents
      next()
    })
}, sendResult)

function sendResult (req, res) {
  res.locals.json = []
  res.locals.docs.forEach(doc => {
    res.locals.json.push(doc.toJSON())
  })
  console.log(JSON.stringify(res.locals.json))
  res.json(req.query.asObject ? { elements: res.locals.json } : res.locals.json)
}

// ------------------------------------------------------//
// CREATE // POST
// ------------------------------------------------------//

router.post('/:version/gallery', (req, res, next) => {
  Gallery.create({
    name: req.body.name,
    contents: req.body.contents
  },
  (err) => {
    if (err) return next(err)
    res.sendStatus(201)
  })
})

router.post('/:version/file', (req, res, next) => {
  if (!req.files || !req.files.url) return next(new Error('Error: Files missing'))

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
    err => {
      if (err) return next(err)
      res.sendStatus(201)
    })
  })
})

// ------------------------------------------------------//
// UPDATE // PUT
// ------------------------------------------------------//

// Gallery
// ----------
router.put('/:version/gallery/:id?', async (req, res, next) => {
  const id = req.params.id || req.query.id
  if (!id) return next(new Error('No id field provided as parameter or query'))

  const ops = {
    add (doc) { doc.contents.push(req.body.content) },
    pop (doc) { doc.contents.pop() },
    shift (doc) { doc.contents.shift() },
    splice (doc) { doc.contents.splice(req.body.i, req.body.amount || 1) },
    name (doc) { if (req.query.name) doc.name = req.query.name }
  }

  if (!ops[req.query.op]) return next(new Error('Missing or invalid operation in query.'))
  try {
    const doc = await Gallery.findById(id).exec()
    ops[req.query.op](doc)
    await doc.save()
  } catch (reason) {
    return next(new Error(reason))
  }
})

// Content
// ----------
router.put('/:version/content/:id?', (req, res, next) => {
  const id = req.params.id || req.query.id
  if (!id) return next(new Error('No id field provided as parameter or query'))

  const update = {
    order: req.body.order,
    enabled: req.body.enabled,
    type: req.body.type,
    url: req.body.url,
    desc: req.body.string,
    addedBy: req.body.user._id
  }

  Content.findByIdAndUpdate(id, update, (err) => {
    if (err) return next(err)
    res.sendStatus(201)
  })
})

// Target
// ----------
router.put('/:version/target/:id', (req, res, next) => {
  const id = req.params.id || req.query.id
  if (!id) return next(new Error('No id field provided as parameter or query'))

  const update = {
    name: req.body.name,
    gallery: mongoose.Types.ObjectId(req.body.gallery)
  }

  Target.findByIdAndUpdate(id, update, (err) => {
    if (err) return next(err)
    res.sendStatus(201)
  })
})

// ------------------------------------------------------//
// DELETE // DELETE
// ------------------------------------------------------//

router.delete('/:version/content/:id?', (req, res, next) => {
  const id = req.params.id || req.query.id
  if (!id) return next(new Error('No id field provided as parameter or query'))

  Content.findByIdAndDelete(id, (err) => {
    if (err) return next(err)
    res.sendStatus(200)
  })
})

module.exports = router
