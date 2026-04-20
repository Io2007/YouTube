import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
dotenv.config();

// Import route modules
import apiRoutes from './routes/api.js';

// Import libraries - will be dynamically imported in routes to handle ESM
// const { Innertube } = require('youtubei.js'); // Removed static import

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
let initializationAttempts = 0;
const MAX_INIT_ATTEMPTS = 3;
const INIT_RETRY_DELAY = 2000; // 2 seconds

async function initYouTubeMusic() {
  initializationAttempts++;
  try {
    // Dynamic import for ESM module
    const { Innertube } = await import('youtubei.js');
    
    // Create with custom fetch options for better serverless compatibility
    const yt = await Innertube.create({
      fetch: globalThis.fetch,
      retrieve_player: false,  // Disable player retrieval to avoid signature decipher issues
      cookie: undefined,
      po_token: undefined,
      visitor_data: undefined,
      generate_session_locally: true
    });
    
    youtubeMusic = yt;
    app.locals.youtubeMusic = yt;
    console.log('[YouTube Music] Client initialized successfully (attempt ' + initializationAttempts + ')');
  } catch (error) {
    console.error('[YouTube Music] Initialization failed (attempt ' + initializationAttempts + '):', error.message);
    
    // Retry if we haven't exceeded max attempts
    if (initializationAttempts < MAX_INIT_ATTEMPTS) {
      console.log('[YouTube Music] Retrying initialization in ' + (INIT_RETRY_DELAY/1000) + 's...');
      setTimeout(initYouTubeMusic, INIT_RETRY_DELAY);
    } else {
      console.error('[YouTube Music] Max initialization attempts reached. Will retry on next request.');
    }
  }
}

// Start initialization
initYouTubeMusic();

// Helper to ensure YouTube Music is initialized before handling requests
async function ensureYouTubeMusicInitialized() {
  if (youtubeMusic) {
    return youtubeMusic;
  }
  
  // Try to initialize on-demand if not already initialized
  if (initializationAttempts < MAX_INIT_ATTEMPTS) {
    await initYouTubeMusic();
  }
  
  return youtubeMusic;
}

// Manifest endpoint for Eclipse Music Addon
app.get('/manifest.json', (req, res) => {
  const baseUrl = req.protocol + '://' + req.get('host');
  res.json({
    id: 'com.youtubemusic.addon',
    name: 'YouTube Music Addon',
    version: '1.0.0',
    description: 'Search and stream music from YouTube Music using Piped/Invidious',
    icon: 'https://www.youtube.com/s/desktop/img/favicon_144x144.png',
    resources: ['search', 'stream', 'catalog'],
    types: ['track', 'album', 'artist', 'playlist'],
    contentType: 'music',
    // Base URL for catalog endpoints (Eclipse will use this to construct URLs)
    baseUrl: baseUrl
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    name: 'YouTube Music API - Eclipse Addon',
    description: 'Search and stream music from YouTube Music with full Eclipse Music Addon support',
    version: '1.0.0',
    eclipseAddon: true,
    endpoints: {
      manifest: '/manifest.json',
      search: '/search?q={query}',
      stream: '/stream/{id}',
      album: '/album/{id}',
      artist: '/artist/{id}',
      playlist: '/playlist/{id}',
      health: '/health'
    },
    resources: ['search', 'stream', 'catalog'],
    types: ['track', 'album', 'artist', 'playlist']
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API routes - search, stream, and catalog endpoints (no prefix for Eclipse addon compatibility)
app.use('/', apiRoutes);

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
    console.log(`📍 Search endpoint: http://localhost:${PORT}/search`);
    console.log(`🎵 Stream endpoint: http://localhost:${PORT}/stream/:id`);
    console.log(`💿 Album endpoint: http://localhost:${PORT}/album/:id`);
    console.log(`👤 Artist endpoint: http://localhost:${PORT}/artist/:id`);
    console.log(`📋 Playlist endpoint: http://localhost:${PORT}/playlist/:id`);
  });
}

// Export helper function for use in routes
export { ensureYouTubeMusicInitialized };

export default app;
