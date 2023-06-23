const express = require('express');
const bodyParser = require('body-parser');
const socket = require('socket.io');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Render Index page
app.get('/', (req, res) => {
  res.render('index');
});

// Start Server
const server = app.listen(port, () => {
  console.log(`Server Running on ${port}`);
});

// Socket IO
const io = socket(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    transports: ['websocket', 'polling'],
    credentials: true,
  },
  allowEIO3: true,
});

require('./utils/socket')(io);
require('./utils/cron')(io);
