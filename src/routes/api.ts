import express from 'express'
import { NextFunction, Request, Response } from 'express'

import mongoose, { Collection } from 'mongoose'
import { Error, Document } from 'mongoose'
import { Content, ContentDocument } from '../models/Content'
import { Target, TargetDocument } from '../models/Target'

import fileUpload from 'express-fileupload'
import { UploadedFile } from 'express-fileupload'

import path = require('path')
import { CollectionDocument } from '../models/Collection';

const router = express.Router()

// Request parsers
router.use(express.json())
router.use(express.urlencoded({ extended: true }))
router.use(fileUpload({
  createParentPath: true,
  preserveExtension: true,
  useTempFiles: false,
}))

// Connect to MongoDB
mongoose.connect('mongodb://localhost/test', { useNewUrlParser: true })
mongoose.connection.on('error', console.error.bind(console, 'connection error:'))
mongoose.connection.once('open', () => { console.log('mongoose connected') })

// ------------------------------------------------------//
// READ // GET
// ------------------------------------------------------//

router.get('/:version/content', (req: Request, res: Response, next: NextFunction) => {

  Content.find({}, req.query.select, (err: Error, docs: ContentDocument[]) => {
    if (err) return next(err)
    res.locals.docs = docs
    next()
  })

}, sendResult)

router.get('/:version/target', (req: Request, res: Response, next: NextFunction) => {

  Target.find({}, req.query.select, (err: Error, docs: TargetDocument[]) => {
    if (err) return next(err)
    res.locals.docs = docs
    next()
  })

}, sendResult)

router.get('/:version/target/contents', (req: Request, res: Response, next: NextFunction) => {

  Target
    .findOne({})
    .populate({
      path: 'collection',
      populate: {path: 'contents'},
    })
    .exec((err: Error, target: TargetDocument) => {
      if (err) return next(err)
      res.locals.docs = (target.collection as CollectionDocument).contents
      next()
    })
}, sendResult)

function sendResult (req: Request, res: Response): void{

  res.locals.docs.forEach((doc: Document) => {
    res.locals.json.push(doc.toJSON())
  })
  res.json(req.query.asObject ? { elements: res.locals.json } : res.locals.json)
}

// ------------------------------------------------------//
// CREATE // POST
// ------------------------------------------------------//

router.post('/:version/:table', (req: Request, res: Response, next: NextFunction) => {
  if (!req || !req.files || !req.files.url) return next(new Error("Error: Files missing"))
  
  const file = req.files.url as UploadedFile
  const type: string = file.mimetype.split('/')[0]
  const serverDir: string = path.join('.', 'public', 'ar', type, file.name)
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
      url: publicDir,
    },
    (err: Error) => {
      if (err) return next(err)
      res.sendStatus(201)
    })
  })
})

// ------------------------------------------------------//
// UPDATE // PUT
// ------------------------------------------------------//

// TODO: Add put method

// ------------------------------------------------------//
// DELETE // DELETE
// ------------------------------------------------------//

router.delete('/:version/:model', (req: Request, res: Response, next: NextFunction) => {
  Content.findByIdAndDelete(req.query._id, (err: Error) => {
    if (err) return next(err)
    res.sendStatus(200)
  })
})

module.exports = router
