var express = require('express')
var axios = require('axios')
var Quarters = require('node-quarters')

var config = require('../config')

// get quarters instance
var quarters = new Quarters(config.quarters)

// router
var router = express.Router()

// user cache (you can store in database and map with your own user)
const userCache = {}
const rooms = {}

const coinFlip = () => {
  return Math.floor(Math.random() * 2) == 0 ? 0 : 1
}

const transferToWinner = roomId => {
  const room = rooms[roomId]
  const winner = room[coinFlip()]

  // emit event for winner
  config.io.to('rooms').emit(
    'winner',
    JSON.stringify({
      event: 'winner',
      roomId: roomId,
      winner: winner,
      name: userCache[winner].displayName
    })
  )

  // transfer quarters to winner
  return quarters.transferQuarters({
    user: winner,
    amount: 1850
  })
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {title: 'Simple bet'})
})

router.post('/code', function(req, res, next) {
  var code = req.body.code

  // create refresh token for user and fetch user
  return quarters
    .createRefreshToken(code)
    .then(({access_token, refresh_token}) => {
      // fetch user
      return quarters.fetchUser(access_token).then(userInfo => {
        // set user details
        userCache[userInfo.id] = userInfo
        // set session userid
        req.session.userId = userInfo.id
        return res.json({
          access_token: access_token,
          refresh_token: refresh_token
        })
      })
    })
    .catch(e => {
      console.log(e)
      return res.status(400).json({
        message: e.message || 'Something went wrong. Try again.'
      })
    })
})

router.post('/join', function(req, res, next) {
  if (!req.session.userId && !userCache[req.session.userId]) {
    return res.status(401).json({
      message: 'Unauthorized'
    })
  }

  var roomId =
    req.body.code ||
    Math.random()
      .toString(36)
      .substring(7)

  var txId = req.body.txId
  if (!txId) {
    return res.status(400).json({
      message: 'txId is required'
    })
  }

  // check if tx id is valid and wait for confirmation
  rooms[roomId] = rooms[roomId] || []
  rooms[roomId].push(req.session.userId)

  // emit joined event to socket
  config.io.to('rooms').emit(
    'joined',
    JSON.stringify({
      event: 'joined',
      roomId: roomId,
      id: req.session.userId,
      name: userCache[req.session.userId].displayName
    })
  )

  if (rooms[roomId].length == 2) {
    // transfer to winner
    transferToWinner(roomId)
      .then(() => {
        delete rooms[roomId]
        // send room id
        res.json({
          room: roomId
        })
      })
      .catch(e => {
        console.log(e)
        res.status(400).json({
          message: e.message || 'Something went wrong.'
        })
      })
  } else {
    // send room id
    res.json({
      room: roomId
    })
  }
})

module.exports = router
