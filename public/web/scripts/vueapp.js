let table = document.getElementById('table')

window.addEventListener('load', function () {
  loadTable()
})

function sendData (data) {
  let XHR = new XMLHttpRequest()

  XHR.addEventListener('load', function (event) {
    // alert(event.target.responseText);
    loadTable()
  })
  XHR.addEventListener('error', function (event) {
    alert('Oops! Something went wrong.')
  })

  XHR.open('POST', '/api/v1/add/')
  XHR.send(data)
}

function loadTable () {
  let XHR = new XMLHttpRequest()

  XHR.addEventListener('load', function (event) {
    if (this.status == 200) {
      app.$data.table = JSON.parse(this.responseText)
    }
  })
  XHR.addEventListener('error', function (event) {
    alert('Oops! Something went wrong.')
  })

  XHR.open('GET', '/api/elements/select/all', true)
  XHR.send()
}

let app = new Vue({
  el: '#app',
  data: {
    table: []
  },
  methods: {
    clearDB: function () {
      let XHR = new XMLHttpRequest()
      XHR.addEventListener('load', function (event) {
        if (this.status == 200) {
          console.log('data deleted successfully')
          loadTable()
        }
      })
      XHR.addEventListener('error', function (event) {
        alert('Oops! Something went wrong.')
      })
      XHR.open('GET', '/api/v1/delete/all')
      XHR.send()
    },
    deleteItem: function (target) {
      let XHR = new XMLHttpRequest()
      XHR.addEventListener('load', function (event) {
        if (this.status == 200) {
          console.log('data deleted successfully')
          loadTable()
        }
      })
      XHR.addEventListener('error', function (event) {
        alert('Oops! Something went wrong.')
      })
      XHR.open('GET', `/api/v1/delete/id=${target}`)
      XHR.send()
    },
    submitForm (e) {
      e.preventDefault()
      let FD = new FormData(document.getElementById('form'))
      sendData(FD)
    }
  }
})
