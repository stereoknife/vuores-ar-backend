const express = require('express')

const mongoose = require('mongoose')
const Content = require('../models/File')

const router = express.Router()

// ------------------------------------------------------//
// READ // GET
// ------------------------------------------------------//

router.get('/file/:id?', async (req, res, next) => {
  try {
    const id = req.params.id || req.query.id
    if (!id && !name)
      throw Error('No id field provided as parameter or query')
    const doc = await File
      .find(id)
      .exec()
    return res.status(200).json(req.query.asObject ? { elements: doc.toJSON } : doc.toJSON)
  } catch (err) {
    return next(err)
  }
})

router.get('/files/', async (req, res, next) => {
  try {
    const find = {}[req.query.findKey] = req.query.findVal
    const docs = await File
      .find(find)
      .populate('file')
      .exec()
    return res.status(200).json(req.query.asObject ? { elements: docs.toJSON } : docs.toJSON)
  } catch (err) {
    return next(err)
  }
})


router.post('/file', async (req, res, next) => {
  try {
    // Check that files exist
    if (!req.files || !req.files.file)
    return next(new Error('File missing'))
    // Get data for file doc
    const type = req.files.file.mimetype.split('/')[0]
    const name = Date.now().toString(16)
    const ext = req.files.file.name.split('.').pop()
    const dir = path.join('public', 'ar', type, name)

    if (type !== 'image')
      throw new Error('Only images are supported at this moment')

    const vals = await Promise.all([
      sharp(req.files.file.data).clone().resize(1000).toFile([dir, ext].join('.')),
      new Promise((resolve, reject) => {
        File.create({
          type: type,
          name: name,
          ext: ext
        })
          .then(doc => resolve(doc))
          .catch(err => reject(err))
      })
    ])
    res.status(201).json(vals[1].toJSON())
  } catch (err) {
    return next(err)
  }
})

router.post('/files', async (req, res, next) => {
  try {
    // Check that files exist
    if (!req.files)
    throw new Error('Files missing')

    const res.locals.return = []
    await req.files.forEach(async f => {
      // Get data for file doc
      const type = f.mimetype.split('/')[0]
      const name = Date.now().toString(16)
      const ext = f.name.split('.').pop()
      const dir = path.join('public', 'ar', type, name)
  
      if (type !== 'image')
        throw new Error('Only images are supported at this moment')

      const vals = Promise.all([
        sharp(f.data).clone().resize(1000).toFile([dir, ext].join('.')),
        new Promise((resolve, reject) => {
          File.create({
            type: type,
            name: name,
            ext: ext
          })
            .then(doc => resolve(doc))
            .catch(err => reject(err))
        })
      ])
      res.locals.return(vals[1].toJSON())
    })
    res.status(201).json(res.locals.return)
  } catch (err) {
    return next(err)
  }
})

// ------------------------------------------------------//
// UPDATE // PUT
// ------------------------------------------------------//

router.put('/file/:id?', async (req, res, next) => {
  try {
    const id = req.params.id || req.query.id
    if (!id)
      throw new Error('No id field provided as parameter or query')

    const update = {
      name: req.body.name
    }
    await File.findByIdAndUpdate(id, update)
    res.status(200).send('File modified successfully')
  } catch (err) {
    return next(err)
  }
})

router.put('/files', async (req, res, next) => {
  try {
    if (!req.body.files || !Array.isArray(req.body.files))
      throw new Error("No 'contents' array field provided")

    await req.body.contents.forEach(doc, i) => {
      if (!id)
        throw new Error(`Missing id in ${i}:th element`)

      const update = {
        name: req.body.name
      }
      Content.findByIdAndUpdate(id, update).exec()
    })
    res.status(200).send('Files modified successfully')
  } catch (err) {
    return next(err)
  }
})

router.delete('/file', (req, res) => {
  res.status(400).send("'/file' doesn't support DELETE requests, try '/content'")
})

router.delete('/files', (req, res) => {
  res.status(400).send("'/files' doesn't support DELETE requests, try '/content'")
})
