const mongoose = require('mongoose')
const Schema = mongoose.Schema

const gallerySchema = new Schema({
  name: {
    type: String,
    default: 'New Collection',
    required: true
  },
  limit: {
    type: Number,
    default: 10,
    required: true
  }
}, { toJSON: { virtuals: true } })

gallerySchema.virtual('target', {
  ref: 'Target',
  localField: '_id',
  foreignField: 'gallery'
})

gallerySchema.virtual('contents', {
  ref: 'Content',
  localField: '_id',
  foreignField: 'gallery'
})

module.exports = mongoose.model('Gallery', gallerySchema)
