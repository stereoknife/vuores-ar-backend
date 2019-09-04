const mongoose = require('mongoose')
const Schema = mongoose.Schema

const fileSchema = new Schema({
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
  addedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, { toJSON: { virtuals: true } })

fileSchema.virtual('file').get(function () {
  return [this.name, this.ext].join('.')
})
fileSchema.virtual('thumb').get(function () {
  return [this.name, 'thumb', this.ext].join('.')
})
fileSchema.virtual('url').get(function () {
  return `http://${process.env.PUBLIC_ADDRESS}/static/${this.type}/${this.file}`
})
fileSchema.virtual('thumbUrl').get(function () {
  return `http://${process.env.PUBLIC_ADDRESS}/static/${this.type}/${this.thumb}`
})
fileSchema.virtual('contents', {
  ref: 'Content',
  localField: '_id',
  foreignField: 'file'
})

module.exports = mongoose.model('File', fileSchema)
