const express = require('express')

const mongoose = require('mongoose')
const Gallery = require('../models/Gallery')
const File = require('../models/File')

const router = express.Router()

router.get('/gallery/:id?', async (req, res, next) => {
  const id = req.params.id || req.query.id
  if (!id && !name) return next(new Error('No id field provided as parameter or query'))

  try {
    const doc = await Gallery
      .findById(id)
      .select(req.query.select)
      .populate({ path: 'target' })
      .populate({
        path: 'contents',
        populate: {
          path: 'file'
        }
      })
      .exec()
    return res.status(200).json(req.query.asObject ? { elements: doc.toJSON } : doc.toJSON)
  } catch (err) {
    return next(err)
  }
})

router.get('/galleries', async (req, res, next) => {
  const find = {}[req.query.findKey] = req.query.findVal
  try {
    const docs = await Gallery
      .find(find)
      .populate({ path: 'target' })
      .populate({
        path: 'contents',
          populate: {
          path: 'file'
        }
      })
      .exec()
    return res.status(200).json(req.query.asObject ? { elements: docs.toJSON } : docs.toJSON)
  } catch (err) {
    return next(err)
  }
})

function sendResult (req, res) {
  res.locals.json = Array
    .isArray(res.locals.docs)
      ? res.locals.docs.length === 1
        ? res.locals.docs[0].toJSON()
        : res.locals.docs.map(doc => doc.toJSON())
      : res.locals.docs.toJSON()
  res.json(req.query.asObject ? { elements: res.locals.json } : res.locals.json)
}

// ------------------------------------------------------//
// CREATE // POST
// ------------------------------------------------------//

router.post('/gallery', (req, res, next) => {
  Gallery.create({
      name: req.body.name
    },
    (err) => {
      if (err) return next(err)
      res.status(201).send('Successfully created')
    })
})

router.post('/galleries', (req, res, next) => {
  res.status(400).send("/galleries doesn't support POST requests, try /gallery")
})

// ------------------------------------------------------//
// UPDATE // PUT
// ------------------------------------------------------//

router.put('/gallery/:id?', async (req, res, next) => {
  const id = req.params.id || req.query.id
  if (!id) return next(new Error('No id field provided as parameter or query'))

  const update = {
    name: req.query.name
  }

  try {
    await Gallery.findByIdAndUpdate(id, update).exec()
    res.status(200).send('Gallery modified successfully')
  } catch (err) {
    return next(err)
  }
})

router.put('/:version/galleries/', async (req, res, next) => {
  if (!req.body.galleries || !Array.isArray(req.body.galleries)) return next(new Error("No 'targets' array field provided"))

  try {
    await req.body.galleries.forEach(doc, i) => {
      if (!id) return next(new Error(`Missing id in ${i}:th element`))
      const update = {
        name: doc.name
      }
      Gallery.findByIdAndUpdate(id, update).exec()
    })
    res.status(200).send('Gallery modified successfully')
  } catch (err) {
    return next(err)
  }
})

// ------------------------------------------------------//
// DELETE // DELETE
// ------------------------------------------------------//

router.delete('/:version/gallery/:id?', async (req, res, next) => {
  const id = req.params.id || req.query.id
  if (!id) return next(new Error('No id field provided as parameter or query'))

  try {
    const contents = await Content.find({ gallery: id }).exec()
    await contents.forEach(async content => {
      try {
        const file = await File.findById(content.file).populate('contents').exec()
        if (file.contents.length <= 1) File.findByIdAndDelete(content.file).exec()
          .catch (err => next(err))
      } catch (err) {
        return next (err)
      } finally {
        Content.findByIdAndDelete(content._id).exec()
          .catch (err => next(err))
      }
    })
    await Gallery.findByIdAndDelete(id).exec()
    res.sendStatus(200)
  } catch (err) {
    next(err)
  }
})

router.delete('/galleries', (req, res) => {
  res.status(400).send("'/galleries' doesn't support DELETE requests, try '/targets'")
})
