// var socket = io('https://flip-a-coin.now.sh')
var socket = io('http://localhost:3000')
socket.on('connect', function() {
  addMessage('connected')
})
socket.on('joined', function(data) {
  addMessage(data)
})
socket.on('winner', function(data) {
  addMessage(data)
})
socket.on('disconnect', function() {
  addMessage('disconnected')
})

var quarterOptions = {
  appKey: '4ELvnPuxeEWZYw3Fgins',
  appSecret: '3luv5t2fkyh5oyfjalhp8u814pyua4dck',
  // quartersURL: 'http://localhost:3000',
  // apiURL: 'http://localhost:8888/v1/'
  quartersURL: 'https://dev.pocketfulofquarters.com',
  apiURL: 'https://api.dev.pocketfulofquarters.com/v1/'
}

// quarters object
var quarters = new Quarters(quarterOptions)

function addMessage(message) {
  var messageEl = $('#messages')
  messageEl.append('<li>' + message + '</li>')
}

function checkLocalToken() {
  $('.loggedOut').hide()
  $('.loggedIn').hide()

  var refreshToken = window.localStorage.getItem('quarters_sdk:refresh_token')
  if (refreshToken) {
    // set it to quarters
    quarters
      .setRefreshToken(refreshToken)
      .then(function() {
        $('.loggedOut').hide()
        $('.loggedIn').show()
      })
      .then(function() {
        return quarters.me()
      })
      .then(function(userInfo) {
        var nel = $('.name-info')
        nel.text(userInfo.displayName + ' (' + userInfo.id + ')')
      })
  } else {
    $('.loggedOut').show()
    $('.loggedIn').hide()
  }
}

function login() {
  quarters.authorize({
    success: function(data) {
      if (data.code) {
        // fetch refresh token using code
        $.ajax({
          url: '/code',
          method: 'POST',
          data: JSON.stringify({code: data.code}),
          contentType: 'application/json',
          dataType: 'json'
        })
          .then(res => {
            // set refresh token
            window.localStorage.setItem(
              'quarters_sdk:refresh_token',
              res.refresh_token
            )
            checkLocalToken()
          })
          .catch(e => {
            console.log(e)
          })
      }
    }
  })
}

function logout() {
  window.localStorage.removeItem('quarters_sdk:refresh_token')
  checkLocalToken()
}

function join(txId) {
  var roomId = $('#room-id').val()
  roomId =
    roomId ||
    Math.random()
      .toString(36)
      .substring(7)

  // fetch refresh token using code
  $.ajax({
    url: '/join',
    method: 'POST',
    data: JSON.stringify({code: roomId, txId: txId}),
    contentType: 'application/json',
    dataType: 'json'
  })
    .then(res => {
      console.log(res.room)
      $('#room-id').val(res.room)
    })
    .catch(e => {
      console.log(e)
    })
}

function bindHandlers() {
  // login button
  $('.btn-login').on('click', function() {
    login()
  })

  // login button
  $('.btn-logout').on('click', function() {
    logout()
  })

  window.onQuartersCallback = function(data) {
    if (data.txId) {
      join(data.txId)
    }
  }
}

// bind handlers
bindHandlers()

// check login
checkLocalToken()
