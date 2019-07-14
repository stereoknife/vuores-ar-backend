'use strict'

window.onload = function () {
  loadTable()
}

function loadTable () {
  let XHR = new XMLHttpRequest()

  XHR.addEventListener('load', function (event) {
    if (this.status === 200) {
      app.$data.galleries = JSON.parse(this.responseText)
      console.log(app.$data.galleries)
    }
  })
  XHR.addEventListener('error', function (event) {
    alert('Oops! Something went wrong.')
  })

  XHR.open('GET', '/api/v1/gallery?populate=contents', true)
  XHR.send()
}

let app = new Vue({
  el: '#app',
  data: {
    galleries: []
  }
})
