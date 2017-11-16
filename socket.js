module.exports = exports = function(io) {
  io.on('connection', function(socket) {
    socket.join('rooms')
  })
}
