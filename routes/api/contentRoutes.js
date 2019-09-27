const express = require('express')

const mongoose = require('mongoose')
const Content = require(global.paths.models + '/Content')

const router = express.Router()

// ------------------------------------------------------//
// READ // GET
// ------------------------------------------------------//

router.get('/content/:id/:populate', async (req, res, next) => {
  try {
    const doc = await Content
      .find(req.params.id)
      .populate(req.params.populate)
      .exec()
    return res.json(req.query.asObject
      ? { elements: doc.toJSON() }
      : doc.toJSON()
    )
  } catch (err) {
    return next(err)
  }
})

router.get('/contents/:populate?', async (req, res, next) => {
  try {
    const docs = await Content
      .find({ [req.query.findKey]: req.query.findVal })
      .populate(req.params.populate)
      .exec()
    return res.status(200).json(req.query.asObject
      ? { elements: docs.toJSON() }
      : docs.map(d => d.toJSON())
    )
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
        gallery: mongoose.Types.ObjectId(g)
      })
    })
    res.status(201).send('Content created')
  } catch (err) {
    return next(err)
  }
})

router.post('/contents', (req, res, next) => {
  res.status(400).send("/contents doesn't support POST requests, try /content")
})

// ------------------------------------------------------//
// UPDATE // PUT
// ------------------------------------------------------//

router.put('/content/:id?', async (req, res, next) => {
  try {
    const id = req.params.id || req.query.id
    if (!id)
      throw new Error('No id field provided as parameter or query')

    const update = {
      order: req.body.order,
      enabled: req.body.enabled,
      desc: req.body.desc,
      gallery: mongoose.Types.ObjectId(req.body.gallery)
    }
    Content.findByIdAndUpdate(id, update)
    res.status(200).send('Content modified successfully')
  } catch (err) {
    return next(err)
  }
})

router.put('/contents', async (req, res, next) => {
  try {
    if (!req.body.contents || !Array.isArray(req.body.contents))
      throw new Error("No 'contents' array field provided")

    await req.body.contents.forEach((doc, i) => {
      if (!doc.id) return next(new Error(`Missing id in ${i}:th element`))
      const update = {
        order: req.body.order,
        enabled: req.body.enabled,
        desc: req.body.desc,
        gallery: mongoose.Types.ObjectId(req.body.gallery)
      }
      Content.findByIdAndUpdate(doc.id, update).exec()
    })
    res.status(200).send('Content modified successfully')
  } catch (err) {
    return next(err)
  }
})

// ------------------------------------------------------//
// DELETE // DELETE
// ------------------------------------------------------//

router.delete('/content/:id?', async (req, res, next) => {
  try {
    const id = req.params.id || req.query.id
    if (!id)
      throw new Error('No id field provided as parameter or query')

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

module.exports = router
