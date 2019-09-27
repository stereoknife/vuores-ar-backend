const express = require('express')

const mongoose = require('mongoose')
const Gallery = require(global.paths.models + '/Gallery')
const File = require(global.paths.models + '/File')
const Content = require(global.paths.models + '/Content')

const router = express.Router()

router.get('/gallery/:id/:populate(*)?', async (req, res, next) => {
  try {
    let populate = req.params.populate
    const doc = await Gallery
      .findById(req.params.id)
      .select(req.query.select)
      .populate((() => {
        if (populate && populate.slice(0, 6) === 'target') {
          populate = populate.slice(7)
          return 'target'
        }
        return undefined
      })())
      .populate(parsePopulate(populate))
      .exec()
    return res.json(req.query.asObject
      ? { elements: doc.toJSON() }
      : doc.toJSON()
    )
  } catch (err) {
    return next(err)
  }
})

router.get('/galleries/:populate(*)?', async (req, res, next) => {
  try {
    let populate = req.params.populate
    const docs = await Gallery
      .find({ [req.query.findKey]: req.query.findVal })
      .populate((() => {
        if (!populate) return undefined
        if (populate.slice(0, 6) === 'target') {
          populate = populate.slice(7)
          return 'target'
        }
        return undefined
      })())
      .populate(parsePopulate(populate))
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
  console.log(pop)
  switch (pop) {
    case undefined:
      return undefined
    case 'all':
      return ({
        path: 'contents',
        populate: {
          path: 'file'
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

router.post('/gallery/', async (req, res, next) => {
  try {
    const doc = await Gallery.create({
      name: req.body.name
    }).exec()
    if (req.query.return) {
      if (req.query.return === 'document') return res.status(201).json(doc)
    }
    return res.status(201).send('Successfully created')
  }
  catch (err) {
    return next(err)
  }
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

router.put('/galleries/', async (req, res, next) => {
  try {
    if (!req.body.galleries || !Array.isArray(req.body.galleries))
      throw new Error("No 'targets' array field provided")

    await req.body.galleries.forEach((doc, i) => {
      if (!doc.id) return next(new Error(`Missing id in ${i}:th element`))
      const update = {
        name: doc.name
      }
      Gallery.findByIdAndUpdate(doc.id, update).exec()
    })
    res.status(200).send('Gallery modified successfully')
  } catch (err) {
    return next(err)
  }
})

// ------------------------------------------------------//
// DELETE // DELETE
// ------------------------------------------------------//

router.delete('/gallery/:id?', async (req, res, next) => {
  const id = req.params.id || req.query.id
  if (!id) return next(new Error('No id field provided as parameter or query'))

  try {
    const contents = await Content.find({ gallery: id }).exec()
    await contents.forEach(async content => {
      try {
        const file = await File.findById(content.file).populate('contents').exec()
        if (file.contents.length <= 1) {
          File.findByIdAndDelete(content.file).exec()
            .catch(err => next(err))
        }
      } catch (err) {
        return next(err)
      } finally {
        Content.findByIdAndDelete(content._id).exec()
          .catch(err => next(err))
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

module.exports = router
