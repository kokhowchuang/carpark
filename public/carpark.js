// Socket server URL
const socket = io.connect('http://localhost:3000');

// Join a common room
socket.emit('subcribe');

socket.on('subcribed', () => {
  const status = document.getElementById('status');
  status.innerHTML = 'Connected';
});

socket.on('updated', (data) => {
  let html = '';

  data.map((item) => {
    html += `<div class="size">${item.name}</div>`;
    html += `<div class="wrapper">`;
    html += `<div>HIGHEST (${item.highest.lots_available} lots available)</div>`;
    html += `<div>${item.highest.carpark_number.join(', \n')}</div>`;
    html += `</div>`;
    html += `<div class="wrapper">`;
    html += `<div>LOWEST (${item.lowest.lots_available} lots available)</div>`;
    html += `<div>${item.lowest.carpark_number.join(', \n')}</div>`;
    html += `</div>`;
    html += `<div class="separator"></div>`;
  });

  const container = document.getElementById('container');
  container.innerHTML = html;
});
