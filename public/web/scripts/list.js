'use strict'

window.onload = function () {
  loadTable()
}

function loadTable () {
  let XHR = new XMLHttpRequest()

  XHR.addEventListener('load', function (event) {
    if (this.status === 200) {
      app.$data.table = JSON.parse(this.responseText)
    }
  })
  XHR.addEventListener('error', function (event) {
    alert('Oops! Something went wrong.')
  })

  XHR.open('GET', '/api/v1?wrap=false', true)
  XHR.send()
}

let app = new Vue({
  el: '#app',
  data: {
    table: []
  },
  methods: {
    deleteItem: function (target) {
      let XHR = new XMLHttpRequest()
      XHR.addEventListener('load', function (event) {
        if (this.status === 200) {
          console.log('data deleted successfully')
          loadTable()
        }
      })
      XHR.addEventListener('error', function (event) {
        alert('Oops! Something went wrong.')
      })
      XHR.open('DELETE', `/api/v1/content?_id=${target}`)
      XHR.send()
    }
  }
})
