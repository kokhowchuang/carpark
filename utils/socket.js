// Socket connection
function socket(io) {
  io.on('connection', (socket) => {
    socket.on('subcribe', () => {
      // Send connection status
      io.emit('subcribed');
    });
  });
}

module.exports = socket;
