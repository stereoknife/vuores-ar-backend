const mongoose = require('mongoose')
const Schema = mongoose.Schema

const contentSchema = new Schema({
  order: {
    type: Number,
    required: true
  },
  enabled: {
    type: Boolean,
    default: true,
    required: true
  },
  type: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  file: {
    type: Schema.Types.ObjectId,
    ref: 'File',
    required: true
  },
  desc: String,
  gallery: {
    type: Schema.Types.ObjectId,
    required: true
  },
  addedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  updateTime: {
    type: Date,
    default: Date.now()
  }
}, { toJSON: { virtuals: true } })

module.exports = mongoose.model('Content', contentSchema)
