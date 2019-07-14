const mongoose = require('mongoose')
const Target = require('./Target')
const Schema = mongoose.Schema

const gallerySchema = new Schema({
  name: {
    type: String,
    default: 'New Collection',
    required: true
  },
  contents: [{
    type: Schema.Types.ObjectId,
    ref: 'Content'
  }]
})

gallerySchema.virtual('target').get(() => {
  return Target.findOne({ gallery: this._id }, doc => {
    return doc
  })
})

module.exports = mongoose.model('Gallery', gallerySchema)
