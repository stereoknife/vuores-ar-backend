var express = require('express')
var router = express.Router()

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' })
})

/* GET upload page. */
router.get('/upload', function (req, res) {
  res.render('upload.pug', { title: 'Express' })
})

/* GET list page. */
router.get('/list', function (req, res) {
  res.render('list.pug', { title: 'Express' })
})

/* GET login page. */
router.get('/login', function (req, res) {
  res.render('login.pug', { title: 'Express' })
})

/* GET signup page. */
router.get('/signup', function (req, res) {
  res.render('signup.pug', { title: 'Express' })
})

module.exports = router
