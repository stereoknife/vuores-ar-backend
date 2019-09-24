const express = require('express')

const mongoose = require('mongoose')
const File = require(global.paths.models + '/File')

const sharp = require('sharp')
const path = require('path')

const router = express.Router()

// ------------------------------------------------------//
// READ / GET
// ------------------------------------------------------//

router.get('/file/:id', async (req, res, next) => {
  try {
    const doc = await File
      .find(req.params.id)
      .exec()
    return res.json(req.query.asObject
      ? { elements: doc.toJSON() }
      : doc.toJSON()
    )
  } catch (err) {
    return next(err)
  }
})

router.get('/files/:populate(*)?', async (req, res, next) => {
  try {
    const docs = await File
      .find({ [req.query.findKey]: req.query.findVal })
      .exec()
    return res.status(200).json(req.query.asObject
      ? { elements: docs.map(d => d.toJSON()) }
      : docs.map(d => d.toJSON())
    )
  } catch (err) {
    return next(err)
  }
})

// ------------------------------------------------------//
// CREATE / POST
// ------------------------------------------------------//

router.post('/file', async (req, res, next) => {
  try {
    // Check that files exist
    if (!req.files || !req.files.file)
      throw new Error('File missing')
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

    res.locals.return = []
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
// UPDATE / PUT
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

    await req.body.contents.forEach((doc, i) => {
      if (!doc.id)
        throw new Error(`Missing id in ${i}:th element`)

      const update = {
        name: req.body.name
      }
      File.findByIdAndUpdate(doc.id, update).exec()
    })
    res.status(200).send('Files modified successfully')
  } catch (err) {
    return next(err)
  }
})

// ------------------------------------------------------//
// DELETE / DELETE
// ------------------------------------------------------//

router.delete('/file', (req, res) => {
  res.status(400).send("'/file' doesn't support DELETE requests, try '/content'")
})

router.delete('/files', (req, res) => {
  res.status(400).send("'/files' doesn't support DELETE requests, try '/content'")
})

module.exports = router
