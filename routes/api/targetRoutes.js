const express = require('express')

const mongoose = require('mongoose')
const Target = require(global.paths.models + '/Target')

const router = express.Router()

// ------------------------------------------------------//
// READ // GET
// ------------------------------------------------------//

router.get('/target/:id/:populate(*)?', async (req, res, next) => {
  try {
    const doc = await Target
      .findById(req.params.id)
      .populate(parsePopulate(req.params.populate))
      .exec()
    return res.json(req.query.asObject
      ? { elements: doc.toJSON() }
      : doc.toJSON()
    )
  } catch (err) {
    return next(err)
  }
})

router.get('/targets/:populate(*)?', async (req, res, next) => {
  try {
    const docs = await Target
      .find({ [req.query.findKey]: req.query.findVal })
      .populate(parsePopulate(req.params.populate))
      .exec()
    return res.status(200).json(req.query.asObject
      ? { elements: docs.map(d => d.toJSON()) }
      : docs.map(d => d.toJSON())
    )
  } catch (err) {
    return next(err)
  }
})

function parsePopulate (pop) {
  switch (pop) {
    case undefined:
      return undefined
    case 'all':
      return ({
        path: 'gallery',
        populate: {
          path: 'contents',
          populate: {
            path: 'file'
          }
        }
      })
    default:
      return pop
        .split('/')
        .reverse()
        .reduce((prev, curr) => ({
          path: curr,
          populate: prev
        }))
  }
}

// ------------------------------------------------------//
// CREATE // POST
// ------------------------------------------------------//

router.post('/target', (req, res, next) => {
  Target.create({
    name: req.body.name,
    gallery: req.body.gallery
  })
    .then(() => res.status(201).send('Successfully created'))
    .catch(err => next(err))
})

router.post('/targets', (req, res, next) => {
  res.status(400).send("/targets doesn't support POST requests, try /target")
})

// ------------------------------------------------------//
// UPDATE // PUT
// ------------------------------------------------------//

router.put('/target/:id?', async (req, res, next) => {
  try {
    const id = req.params.id || req.query.id
    if (!id)
      throw new Error('No id field provided as parameter or query')

    const update = {
      name: req.body.name,
      gallery: req.body.gallery ? mongoose.Types.ObjectId(req.body.gallery) : undefined
    }
    await Target.findByIdAndUpdate(id, update).exec()
    res.status(200).send('Target modified successfully')
  } catch (err) {
    return next(err)
  }
})

router.put('/targets/', async (req, res, next) => {
  try {
    if (!req.body.targets || !Array.isArray(req.body.targets))
      throw new Error("No 'targets' array field provided")

    const targets = req.body.targets
    await targets.forEach((doc, i) => {
      if (!doc.id) return next(new Error(`Missing id in ${i}:th element`))
      const update = {
        name: doc.name,
        gallery: req.body.gallery ? mongoose.Types.ObjectId(req.body.gallery) : undefined
      }
      Target.findByIdAndUpdate(doc.id, update).exec()
    })
    res.status(200).send('Targets modified successfully')
  } catch (err) {
    return next(err)
  }
})

// ------------------------------------------------------//
// DELETE // DELETE
// ------------------------------------------------------//

router.delete('/target/:id?', async (req, res, next) => {
  try {
    const id = req.params.id || req.query.id
    if (!id)
      throw new Error('No id field provided as parameter or query')

    await Target.findByIdAndDelete(id).exec()
    res.status(200).send('Target successfully deleted')
  } catch (err) {
    next(err)
  }
})

router.delete('/targets', (req, res) => {
  res.status(400).send("'/targets' doesn't support DELETE requests, try '/target'")
})

module.exports = router
