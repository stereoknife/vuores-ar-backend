const mongoose = require('mongoose')
const Schema = mongoose.Schema

const targetSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  collection: {
    type: Schema.Types.ObjectId
  },
  updateTime: {
    type: Date,
    default: Date.now()
  }
})

module.exports = mongoose.model('Target', targetSchema)
