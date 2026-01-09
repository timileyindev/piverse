require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all for dev, restrict in prod
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/piverse';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Socket.io for Real-time Feeds
let watchers = 0;

io.on('connection', (socket) => {
  watchers++;
  io.emit('watcher_count', watchers);
  console.log(`Client connected: ${socket.id} (Total Watchers: ${watchers})`);
  
  socket.on('disconnect', () => {
    watchers = Math.max(0, watchers - 1);
    io.emit('watcher_count', watchers);
    console.log(`Client disconnected: ${socket.id} (Total Watchers: ${watchers})`);
  });
});

// Make io available in routes
app.set('io', io);

// Routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send('PI VERSE Backend Online');
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
