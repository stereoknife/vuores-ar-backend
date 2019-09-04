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
  name: {
    type: String,
    required: true
  },
  ext: {
    type: String,
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

contentSchema.virtual('file').get(function () {
  return [this.name, this.ext].join('.')
})
contentSchema.virtual('thumb').get(function () {
  return [this.name, 'thumb', this.ext].join('.')
})
contentSchema.virtual('url').get(function () {
  return `http://${process.env.PUBLIC_ADDRESS}/static/${this.type}/${this.file}`
})
contentSchema.virtual('thumbUrl').get(function () {
  return `http://${process.env.PUBLIC_ADDRESS}/static/${this.type}/${this.thumb}`
})
module.exports = mongoose.model('Content', contentSchema)
