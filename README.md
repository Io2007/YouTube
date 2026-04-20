# 🎵 Muzo-backend - Eclipse Music Addon

<img src="icon.png" alt="Muzo-backend" width="320" height="320" align="center">

A powerful Node.js/Express.js API that provides access to YouTube Music with full **Eclipse Music Addon** compatibility. Search songs, albums, artists, playlists and stream music using Piped/Invidious proxies.

**🌐 Backend BaseUrl:** [https://Muzo-backend.vercel.app](https://Muzo-backend.vercel.app)

![API Status](https://img.shields.io/badge/API-Online-green)
![Node.js](https://img.shields.io/badge/Node.js-20.x-brightgreen)
![Express.js](https://img.shields.io/badge/Express.js-4.x-lightgrey)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

### Eclipse Addon Capabilities
- 🔍 **Search** - Search dropdown integration for music discovery
- ▶️ **Stream** - Resolves playable URLs for playback picker
- 📚 **Catalog** - Full detail endpoints for albums, artists, and playlists
- 🎵 **Types Supported** - track, album, artist, playlist

### Music Sources
- 🎵 **YouTube Music Integration** - Search songs, albums, artists, playlists
- 📺 **Piped & Invidious** - Privacy-friendly YouTube streaming proxies
- 🔄 **Smart Fallback** - Automatic failover across multiple instances
- 🎶 **Multiple Formats** - MP3, AAC, M4A support via direct stream URLs

### Developer Features
- 📱 **RESTful API** - Clean, well-documented endpoints
- 🔒 **CORS Support** - Cross-origin resource sharing enabled
- 📊 **Comprehensive Logging** - Detailed request/response logging
- ⚡ **Fast Response** - Optimized queries and parallel processing

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/Shashwat-CODING/Muzo-backend.git
cd Muzo-backend

# Install dependencies
npm install

# Start the server
npm start
```

The API will be available at `http://localhost:5000`

### Environment Variables (Optional)

Create a `.env` file:

```env
PORT=5000
NODE_ENV=development
```

## 📚 Eclipse Addon Integration

### Installing the Addon in Eclipse

1. Open Eclipse Music app
2. Go to Settings → Addon Management
3. Click "Install Addon"
4. Enter your addon URL: `https://your-server.com/manifest.json`
5. The addon will appear in your installed addons list

### Addon Manifest

The manifest endpoint (`/manifest.json`) returns:

```json
{
  "id": "com.youtubemusic.addon",
  "name": "YouTube Music Addon",
  "version": "1.0.0",
  "description": "Search and stream music from YouTube Music using Piped/Invidious",
  "icon": "https://www.youtube.com/s/desktop/img/favicon_144x144.png",
  "resources": ["search", "stream", "catalog"],
  "types": ["track", "album", "artist", "playlist"],
  "contentType": "music",
  "baseUrl": "https://your-server.com"
}
```

### Resources Explained

| Resource | Description | Eclipse Feature |
|----------|-------------|-----------------|
| `search` | Your addon can search for music | Shows in search dropdown |
| `stream` | Your addon can resolve playable URLs | Shows in playback picker |
| `catalog` | Supports detail endpoints | Enables album/artist/playlist pages |

### Types Supported

| Type | Description | Example |
|------|-------------|---------|
| `track` | Individual songs | Single tracks from search |
| `album` | Albums/collections | Album detail pages |
| `artist` | Artists | Artist profiles with top songs |
| `playlist` | Curated playlists | Playlist track listings |

## 📚 API Documentation

### Base URL
```
http://localhost:5000
```

### Health Check
```http
GET /health
```

Response:
```json
{
  "status": "ok"
}
```

## 🎵 Eclipse Addon Endpoints

### 1. Manifest (Required)
```http
GET /manifest.json
```

Returns addon metadata for Eclipse to discover capabilities.

### 2. Search Endpoint
```http
GET /search?q={query}
```

**Parameters:**
- `q` (required): Search query string

**Example:**
```bash
curl "http://localhost:5000/search?q=Bohemian%20Rhapsody"
```

**Response (Eclipse Format):**
```json
{
  "tracks": [
    {
      "id": "fJ9rUzIMcZQ",
      "videoId": "fJ9rUzIMcZQ",
      "title": "Bohemian Rhapsody",
      "artist": "Queen",
      "album": "A Night at the Opera",
      "duration": 354,
      "artworkURL": "https://...",
      "format": "mp3"
    }
  ],
  "albums": [...],
  "artists": [...],
  "playlists": [...]
}
```

### 3. Stream Endpoint
```http
GET /stream/{id}
```

**Parameters:**
- `id` (required): Video ID from search results

**Example:**
```bash
curl "http://localhost:5000/stream/fJ9rUzIMcZQ"
```

**Response:**
```json
{
  "url": "https://piped-instance.com/videoplayback?...",
  "format": "mp3",
  "quality": "128kbps"
}
```

### 4. Album Details (Catalog)
```http
GET /album/{id}
```

**Example:**
```bash
curl "http://localhost:5000/album/MPREb_..."
```

**Response:**
```json
{
  "id": "MPREb_...",
  "title": "A Night at the Opera",
  "artist": "Queen",
  "year": "1975",
  "trackCount": 12,
  "artworkURL": "https://...",
  "tracks": [
    {
      "id": "...",
      "title": "Bohemian Rhapsody",
      "duration": 354,
      ...
    }
  ]
}
```

### 5. Artist Details (Catalog)
```http
GET /artist/{id}
```

**Response:**
```json
{
  "id": "UCiMhD4jzUqG-IgPzUmmytRQ",
  "name": "Queen",
  "description": "British rock band...",
  "artworkURL": "https://...",
  "subscribers": "10M",
  "topSongs": [...],
  "albums": [...]
}
```

### 6. Playlist Details (Catalog)
```http
GET /playlist/{id}
```

**Response:**
```json
{
  "id": "PLrEnWoR732-BHrPp_Pm8_VleD68f9s14-",
  "title": "Best of Queen",
  "creator": "YouTube Music",
  "trackCount": 20,
  "artworkURL": "https://...",
  "tracks": [...]
}
```

## 🔧 Advanced Features

### Offline Playback Support
Tracks with `streamURL` (direct URLs) can be downloaded for offline listening. Users can:
- Save individual tracks
- Bulk-download entire playlists
- Play offline without addon server connection

### Default Playback Source
If your manifest includes `"stream"` in resources, your addon appears in:
**Settings → Addon Management → Default Playback**

When selected, Eclipse searches your addon for songs played from Home, Radio, DJ, editorial playlists, etc.

### Token-Based Authentication
Support for authenticated addons:
```
https://my-addon.com/{user_token}/manifest.json
```
Eclipse stores the full URL and automatically includes the token prefix in all subsequent calls.

### Audio Format Support
Eclipse supports: MP3, AAC, M4A, FLAC, WAV, OGG
- FLAC streams instantly via native FLAC streaming engine
- Return format in stream response for optimal playback

### Year Format Flexibility
Both formats accepted:
```json
{ "year": 2024 }  // Number
{ "year": "2024" }  // String
```

## 🛠️ Development

### Project Structure
```
Muzo-backend/
├── app.js              # Main Express application
├── routes/
│   └── api.js          # API routes (search, stream, catalog)
├── package.json        # Dependencies
├── icon.png           # Project icon
└── README.md          # This file
```

### Available Scripts
```bash
# Development
npm run dev

# Production
npm start
```

### Dependencies
- **Express.js**: Web framework
- **youtubei.js**: YouTube Music API client
- **CORS**: Cross-origin resource sharing
- **Helmet**: Security middleware
- **Morgan**: Logging middleware

## 🚀 Deployment

### Vercel Deployment
The API is configured for Vercel deployment:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy - manifest fetches automatically on each request

### Self-Hosting
```bash
# Using Docker
docker build -t muzo-backend .
docker run -p 5000:5000 muzo-backend

# Or directly with Node.js
npm install
npm start
```

## 🔒 Security Features

- **CORS Configuration**: Properly configured for cross-origin requests
- **Input Validation**: All inputs are validated and sanitized
- **Security Headers**: Helmet.js for security headers
- **Error Handling**: No sensitive information in error responses

## 📈 Performance Optimizations

- **Parallel Processing**: Multiple instance checks run in parallel
- **Instance Caching**: Reduces redundant API calls
- **Timeout Management**: Prevents hanging requests (5s per instance)
- **Smart Fallback**: Tries multiple Piped/Invidious instances automatically

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check existing issues on [GitHub](https://github.com/Shashwat-CODING/Muzo-backend/issues)
2. Create a new issue with detailed description
3. Include logs and request/response examples

## 🔗 Links

- **GitHub Repository:** [https://github.com/Shashwat-CODING/Muzo-backend](https://github.com/Shashwat-CODING/Muzo-backend)
- **Live Demo:** [https://shashwat-coding.github.io/Muzo-backend](https://shashwat-coding.github.io/Muzo-backend)
- **Eclipse Music:** [Download Eclipse](https://eclipse-music.app)

## 📋 FAQ

**Can I build an addon in any language?**  
Yes — any language that can serve HTTP with JSON responses works.

**Does my addon need a database?**  
No — your addon just needs to respond to HTTP requests.

**Can my addon require authentication?**  
Yes — include tokens in your addon URL. Eclipse stores the full URL.

**What happens if my addon is offline?**  
Eclipse falls back gracefully — tracks won't play, but the app works fine.

**Can I update my addon without users reinstalling?**  
Yes — just update your server. Eclipse fetches the manifest each time.

**Can users save addon tracks offline?**  
Yes — tracks with streamURL can be downloaded for offline listening.

---

**Made with ❤️ by Shashwat for the Muzo and Eclipse community**
