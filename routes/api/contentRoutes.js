const express = require('express')

const mongoose = require('mongoose')
const Content = require('../models/Content')

const router = express.Router()

// ------------------------------------------------------//
// READ // GET
// ------------------------------------------------------//

router.get('/content/:id?', async (req, res, next) => {
  try {
    const id = req.params.id || req.query.id
    if (!id && !name)
      throw new Error('No id field provided as parameter or query')
    const doc = await Content
      .find(id)
      .populate('file')
      .exec()
    return res.status(200).json(req.query.asObject ? { elements: doc.toJSON } : doc.toJSON)
  } catch (err) {
    return next(err)
  }
})

router.get('/targets/', async (req, res, next) => {
  try {
    const find = {}[req.query.findKey] = req.query.findVal
    const docs = await Content
      .find(find)
      .populate('file')
      .exec()
    return res.status(200).json(req.query.asObject ? { elements: docs.toJSON } : docs.toJSON)
  } catch (err) {
    return next(err)
  }
})

// ------------------------------------------------------//
// CREATE // POST
// ------------------------------------------------------//

router.post('/content', async (req, res, next) => {
  try {
    const galleries = !req.body.galleries
      ? []
      : Array.isArray(req.body.galleries)
        ? req.body.galleries
        : [req.body.galleries]

    await galleries.forEach(async g => {
      const count = await Content
        .findOne({ gallery: g })
        .sort('-order')
        .exec()
      Content.create({
        order: count ? count.order + 1 : 1,
        enabled: true,
        file: req.body.file,
        desc: req.body.desc,
        gallery: g
      })
    })
    res.status(201).send('Content created')
  } catch (err) {
    return next(err)
  }
})

// ------------------------------------------------------//
// UPDATE // PUT
// ------------------------------------------------------//

router.put('/content/:id?', async (req, res, next) => {
  const id = req.params.id || req.query.id
  if (!id)
    return next(new Error('No id field provided as parameter or query'))

  const update = {
    order: req.body.order,
    enabled: req.body.enabled,
    type: req.body.type,
    desc: req.body.desc,
    addedBy: req.body.user
  }

  try {
    Content.findByIdAndUpdate(id, update)
    res.status(200).send('Content modified successfully')
  } catch (err) {
    return next(err)
  }
})

router.put('/contents', async (req, res, next) => {
  if (!req.body.contents || !Array.isArray(req.body.contents))
    return next(new Error("No 'contents' array field provided"))

  try {
    await req.body.contents.forEach(doc, i) => {
      if (!id) return next(new Error(`Missing id in ${i}:th element`))
      const update = {
        order: doc.order,
        enabled: doc.enabled,
        type: doc.type,
        desc: doc.desc,
        addedBy: doc.user
      }
      Content.findByIdAndUpdate(id, update).exec()
    })
    res.status(200).send('Content modified successfully')
  } catch (err) {
    return next(err)
  }
})

router.delete('/content/:id?', async (req, res, next) => {
  const id = req.params.id || req.query.id
  if (!id)
    return next(new Error('No id field provided as parameter or query'))

  try {
    const doc = await Content.findByIdAndDelete(id).exec()
    await Content
      .where('gallery', doc.gallery)
      .where('order').gt(doc.order)
      .updateMany({ $inc: { order: -1 } })
      .exec()
    res.sendStatus(200)
  } catch (err) {
    next(err)
  }
})

router.delete('/contents', (req, res) => {
  res.status(400).send("'/contents' doesn't support DELETE requests, try '/content'")
})
