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
  url: {
    type: String,
    required: true
  },
  desc: String,
  addedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  updateTime: {
    type: Date,
    default: Date.now()
  }
})

module.exports = mongoose.model('Content', contentSchema)
