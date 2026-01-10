require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const { createServer } = require('http');
const { Server } = require('socket.io');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/piverse';

mongoose.connect(MONGODB_URI)
  .then(() => logger.info('Database', 'MongoDB Connected'))
  .catch(err => logger.error('Database', 'MongoDB Connection Error', { error: err.message }));

// Socket.io for Real-time Feeds
let watchers = 0;

io.on('connection', (socket) => {
  watchers++;
  io.emit('watcher_count', watchers);
  logger.debug('Socket', 'Client connected', { socketId: socket.id, watchers });
  
  socket.on('disconnect', () => {
    watchers = Math.max(0, watchers - 1);
    io.emit('watcher_count', watchers);
    logger.debug('Socket', 'Client disconnected', { socketId: socket.id, watchers });
  });
});

// Make io available in routes
app.set('io', io);

// Routes
const configRoutes = require('./routes/config');
app.use('/api/config', configRoutes);

const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send('PI VERSE Backend Online');
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Error Handler (must be last middleware)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  logger.info('Server', `Server running on port ${PORT}`, { 
    env: process.env.NODE_ENV || 'development',
    port: PORT 
  });
});

