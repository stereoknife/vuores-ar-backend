const express = require('express')

const mongoose = require('mongoose')
const Target = require('../models/Target')

const router = express.Router()

// ------------------------------------------------------//
// READ // GET
// ------------------------------------------------------//

router.get('/:version/target/:id?', async (req, res, next) => {
  const id = req.params.id || req.query.id
  if (!id && !name) return next(new Error('No id field provided as parameter or query'))
  try {
    const doc = await Target
      .findById(id)
      .populate({
        path: 'gallery',
        populate: {
          path: 'contents',
          populate: {
            path: 'file'
          }
        }
      })
      .exec()
    return res.status(200).json(req.query.asObject ? { elements: doc.toJSON } : doc.toJSON)
  } catch (err) {
    return next(err)
  }
})

router.get('/:version/targets/', async (req, res, next) => {
  const find = {}[req.query.findKey] = req.query.findVal
  console.log(find)
  try {
    const docs = await Target
      .find(find)
      .populate({
        path: 'gallery',
        populate: {
          path: 'contents',
          populate: {
            path: 'file'
          }
        }
      })
      .exec()
    return res.status(200).json(req.query.asObject ? { elements: docs.toJSON } : docs.toJSON)
  } catch (err) {
    return next(err)
  }
})

// ------------------------------------------------------//
// CREATE // POST
// ------------------------------------------------------//

router.post('/:version/target', (req, res, next) => {
  Target.create({
      name: req.body.name,
      gallery: req.body.gallery
    },
    (err) => {
      if (err) return next(err)
      res.status(201).send('Successfully created')
    })
})

router.post('/:version/targets', (req, res, next) => {
  res.status(400).send("/targets doesn't support POST requests, try /target")
})

// ------------------------------------------------------//
// UPDATE // PUT
// ------------------------------------------------------//

router.put('/:version/target/:id?', async (req, res, next) => {
  const id = req.params.id || req.query.id
  if (!id) return next(new Error('No id field provided as parameter or query'))

  const update = {
    name: req.body.name,
    gallery: req.body.gallery ? mongoose.Types.ObjectId(req.body.gallery) : undefined
  }

  try {
    await arget.findByIdAndUpdate(id, update).exec()
    res.status(200).send('Target modified successfully')
  } catch (err) {
    return next(err)
  }
})

router.put('/:version/targets/', async (req, res, next) => {
  if (!req.body.targets || !Array.isArray(req.body.targets)) return next(new Error("No 'targets' array field provided"))

  try {
    await req.body.targets.forEach(doc, i) => {
      if (!id) return next(new Error(`Missing id in ${i}:th element`))
      const update = {
        name: doc.name,
        gallery: req.body.gallery ? mongoose.Types.ObjectId(req.body.gallery) : undefined
      }
      Target.findByIdAndUpdate(id, update).exec()
    })
    res.status(200).send('Target modified successfully')
  } catch (err) {
    return next(err)
  }
})

// ------------------------------------------------------//
// DELETE // DELETE
// ------------------------------------------------------//

router.delete('/:version/target/:id?', async (req, res, next) => {
  const id = req.params.id || req.query.id
  if (!id)
    return next(new Error('No id field provided as parameter or query'))

  try {
    const doc = await Target.findByIdAndDelete(id).exec()
    res.status(200).send('Target successfully deleted')
  } catch (err) {
    next(err)
  }
})

router.delete('/targets', (req, res) => {
  res.status(400).send("'/targets' doesn't support DELETE requests, try '/target'")
})
