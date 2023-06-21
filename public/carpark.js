// Socket server URL
const socket = io.connect('http://localhost:3000');

// Join a room
socket.emit('subcribe');

socket.on('subcribed', () => {
  console.log(111);
});
