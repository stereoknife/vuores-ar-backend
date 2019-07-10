const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  display: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  hash: {
    type: String,
    required: true
  },
  rank: {
    type: Number,
    required: true,
    default: 0
  }
})

module.exports = mongoose.model('User', userSchema)
