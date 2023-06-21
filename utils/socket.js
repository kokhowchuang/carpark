// Socket connection
function socket(io) {
  io.on('connection', (socket) => {
    socket.on('subcribe', () => {
      // Send carpark statistical data
      io.emit('subcribed');
    });
  });
}

module.exports = socket;
