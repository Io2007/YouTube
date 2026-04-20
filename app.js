const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import route modules
const apiRoutes = require('./routes/api');

// Import libraries
const { Innertube } = require('youtubei.js');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(helmet());
app.use(morgan('combined'));

// Disable ETag generation to prevent 304 responses
app.set('etag', false);

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize YouTube Music client
let youtubeMusic = null;

async function initYouTubeMusic() {
  try {
    const yt = await Innertube.create();
    youtubeMusic = yt;
    app.locals.youtubeMusic = yt;
    console.log('[YouTube Music] Client initialized successfully');
  } catch (error) {
    console.error('[YouTube Music] Initialization failed:', error);
  }
}

initYouTubeMusic();

// Manifest endpoint for Eclipse Music Addon
app.get('/manifest.json', (req, res) => {
  res.json({
    id: 'com.youtubemusic.addon',
    name: 'YouTube Music Addon',
    version: '1.0.0',
    description: 'Search and stream music from YouTube Music using Piped/Invidious',
    icon: 'https://www.youtube.com/s/desktop/img/favicon_144x144.png',
    resources: ['search', 'stream', 'catalog'],
    types: ['track', 'album', 'artist', 'playlist'],
    contentType: 'music'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    name: 'YouTube Music API',
    description: 'Search and stream music from YouTube Music',
    endpoints: {
      manifest: '/manifest.json',
      search: '/api/search',
      stream: '/api/stream/:id'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API routes - only search and stream
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Start server locally; on Vercel we just export the app
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 YouTube Music API server running on port ${PORT}`);
    console.log(`📍 Search endpoint: http://localhost:${PORT}/api/search`);
    console.log(`🎵 Stream endpoint: http://localhost:${PORT}/api/stream/:id`);
  });
}

module.exports = app;
