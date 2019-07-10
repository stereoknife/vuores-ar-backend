const mongoose = require('mongoose')
const Schema = mongoose.Schema

const collectionSchema = new Schema({
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

module.exports = mongoose.model('Collection', collectionSchema)
