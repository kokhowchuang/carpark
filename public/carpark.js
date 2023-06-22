// Socket server URL
const socket = io.connect('http://localhost:3000');

// Join a room
socket.emit('subcribe');

socket.on('subcribed', () => {
  const status = document.getElementById('status');
  status.innerHTML = 'Connected';
});

socket.on('updated', (data) => {
  let html = '';

  data.map((item) => {
    html += `<div>${item.name}</div>`;
    html += `<div>Highest (${item.highest.lots_available} lots available)</div>`;
    html += `<div>${item.highest.carpark_number.join(', \n')}</div>`;

    html += `<div>Lowest (${item.lowest.lots_available} lots available)</div>`;
    html += `<div>${item.lowest.carpark_number.join(', \n')}</div>`;
  });

  const container = document.getElementById('container');
  container.innerHTML = html;
});
