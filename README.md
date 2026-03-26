# 🎵 Muzo-backend

<img src="icon.png" alt="Muzo-backend" width="320" height="320" align="center">

A powerful Node.js/Express.js API that provides access to multiple music streaming services including YouTube Music, YouTube Search, Last.fm, Saavn, Piped, and Invidious. Perfect for building music applications, playlists, and discovery features.

**🌐 Backend BaseUrl:** [https://Muzo-backend.vercel.app](https://Muzo-backend.vercel.app)

![API Status](https://img.shields.io/badge/API-Online-green)
![Node.js](https://img.shields.io/badge/Node.js-20.x-brightgreen)
![Express.js](https://img.shields.io/badge/Express.js-4.x-lightgrey)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

- 🎵 **YouTube Music Integration** - Search songs, albums, artists, playlists
- 🔍 **YouTube Search** - Search videos, channels, playlists with suggestions
- 🎧 **Last.fm Integration** - Get similar tracks and music recommendations
- 🎶 **Saavn API** - Search and stream music from JioSaavn
- 📺 **Piped & Invidious** - Alternative YouTube streaming sources
- 🎨 **Channel Feeds** - Get latest videos from YouTube channels
- 📱 **RESTful API** - Clean, well-documented endpoints
- 🔒 **CORS Support** - Cross-origin resource sharing enabled
- 📊 **Comprehensive Logging** - Detailed request/response logging

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

### 🌐 Frontend Demo

Experience the API in action with our live frontend demo:
- **Live Demo:** [https://Muzo-backend.vercel.app](https://Muzo-backend.vercel.app)
- **Features:** Interactive API testing, real-time search, and streaming capabilities
- **Source:** Built with modern web technologies showcasing all API endpoints

### Environment Variables (Optional)

Create a `.env` file:

```env
PORT=5000
NODE_ENV=development
LASTFM_API_KEY=your_lastfm_api_key
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000
```

### Health Check
```http
GET /health
```

## 🎵 Music Search & Discovery

### 1. YouTube Music Search
Search for songs, albums, artists, and playlists on YouTube Music.

```http
GET /api/search?q={query}&filter={type}&limit={number}
```

**Parameters:**
- `q` (required): Search query
- `filter` (optional): `songs`, `albums`, `artists`, `playlists`, `videos`
- `limit` (optional): Number of results (default: 20)

**Example:**
```bash
curl "http://localhost:5000/api/search?q=edm&filter=songs&limit=10"
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "id": "dQw4w9WgXcQ",
      "title": "Never Gonna Give You Up",
      "artist": "Rick Astley",
      "duration": "3:33",
      "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      "type": "song"
    }
  ]
}
```

### 2. YouTube Search
Search YouTube videos, channels, and playlists.

```http
GET /api/yt_search?q={query}&filter={type}&limit={number}
```

**Example:**
```bash
curl "http://localhost:5000/api/yt_search?q=music&filter=videos&limit=5"
```

### 3. Search Suggestions
Get search suggestions for autocomplete features.

```http
GET /api/search/suggestions?q={query}
```

**Example:**
```bash
curl "http://localhost:5000/api/search/suggestions?q=edm"
```

## 🎧 Music Streaming

### 1. Stream Music
Get streaming URLs from multiple sources (Saavn, Piped, Invidious).

```http
GET /api/stream?id={videoId}&title={title}&artist={artist}
```

**Parameters:**
- `id` (required): YouTube video ID
- `title` (optional): Song title for Saavn matching
- `artist` (optional): Artist name for Saavn matching

**Example:**
```bash
curl "http://localhost:5000/api/stream?id=dQw4w9WgXcQ&title=Never%20Gonna%20Give%20You%20Up&artist=Rick%20Astley"
```

**Response:**
```json
{
  "success": true,
  "service": "saavn",
  "instance": "saavn.dev",
  "streamingUrls": [
    {
      "url": "https://...",
      "quality": "320kbps",
      "format": "mp3"
    }
  ],
  "metadata": {
    "title": "Never Gonna Give You Up",
    "artist": "Rick Astley",
    "duration": "3:33"
  }
}
```

### 2. Similar Tracks
Get similar tracks using Last.fm recommendations.

```http
GET /api/similar?title={title}&artist={artist}&limit={number}
```

**Example:**
```bash
curl "http://localhost:5000/api/similar?title=Shape%20of%20You&artist=Ed%20Sheeran&limit=5"
```

## 📺 Channel Feeds

### 1. Authenticated Channel Feed
Get latest videos from subscribed channels (requires auth token).

```http
GET /api/feed?authToken={token}&preview={boolean}
```

### 2. Unauthenticated Channel Feed
Get latest videos from specified channels.

```http
GET /api/feed/unauthenticated?channels={channelIds}&preview={boolean}
```

**Parameters:**
- `channels` (required): Comma-separated channel IDs
- `preview` (optional): Limit to 5 videos per channel

**Example:**
```bash
curl "http://localhost:5000/api/feed/unauthenticated?channels=UCuAXFkgsw1L7xaCfnd5JJOw,UCBJycsmduvYEL83R_U4JriQ&preview=1"
```

### 3. Path-style Channel Feed
Alternative endpoint format for channel feeds.

```http
GET /api/feed/channels={channelIds}?preview={boolean}
```

**Example:**
```bash
curl "http://localhost:5000/api/feed/channels=UCuAXFkgsw1L7xaCfnd5JJOw,UCBJycsmduvYEL83R_U4JriQ?preview=1"
```

**Response:**
```json
[
  {
    "id": "dQw4w9WgXcQ",
    "authorId": "UCuAXFkgsw1L7xaCfnd5JJOw",
    "duration": "3:33",
    "author": "Rick Astley",
    "views": "1.2B",
    "uploaded": "2009-10-25T06:57:33.000Z",
    "title": "Never Gonna Give You Up"
  }
]
```

## 🎵 Album & Playlist Management

### 1. Get Album Details
Fetch detailed information about an album.

```http
GET /api/album/{albumId}
```

**Example:**
```bash
curl "http://localhost:5000/api/album/MPREb_qTDpBqltt6c"
```

**Response:**
```json
{
  "success": true,
  "album": {
    "id": "MPREb_qTDpBqltt6c",
    "playlistId": "OLAK5uy_mwBKAsTr40eAsSEDTgy6iiEoI2edmH9q8",
    "title": "Releases for you",
    "artist": "Nseeb",
    "year": "2025",
    "thumbnail": "https://lh3.googleusercontent.com/...",
    "tracks": [
      {
        "id": "K9R7KcaettM",
        "title": "I Really Do...",
        "artist": "Nseeb",
        "duration": "3:14",
        "thumbnail": "https://i.ytimg.com/vi/K9R7KcaettM/hqdefault.jpg",
        "videoId": "K9R7KcaettM"
      }
    ]
  }
}
```

## 🔧 Advanced Features

### 1. Dynamic Instance Management
The API automatically fetches and caches streaming instances from remote sources:
- **Piped Instances**: `https://raw.githubusercontent.com/n-ce/Uma/main/dynamic_instances.json`
- **Invidious Instances**: Same source as Piped
- **Saavn API**: Uses `saavn.dev` for reliable access

### 2. Smart Content Filtering
- **Shorts Detection**: Automatically filters out YouTube Shorts from feeds
- **Duration Parsing**: Handles various duration formats (MM:SS, HH:MM:SS)
- **Play Count Filtering**: Distinguishes between artist names and play counts

### 3. Robust Error Handling
- **Service Fallbacks**: If one service fails, tries alternatives
- **Timeout Management**: Configurable timeouts for all requests
- **Retry Logic**: Automatic retries for failed requests
- **Comprehensive Logging**: Detailed logs for debugging

## 📊 Response Formats

### Standard Success Response
```json
{
  "success": true,
  "data": [...],
  "timestamp": "2025-10-16T04:52:24.045Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Pagination Response
```json
{
  "success": true,
  "results": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "hasMore": true
  }
}
```

## 🛠️ Development

### Project Structure
```
Muzo-backend/
├── js/                      # Main project directory
│   ├── app.js              # Main Express application
│   ├── api/
│   │   └── app.js          # Vercel serverless entry point
│   ├── lib/                # Custom libraries
│   │   ├── ytmusicapi.js  # YouTube Music API
│   │   ├── youtube-search.js # YouTube Search API
│   │   ├── lastfm_api.js  # Last.fm integration
│   │   └── get_youtube_song.js # YouTube song helper
│   ├── routes/
│   │   └── api.js          # Main API routes
│   ├── vercel.json         # Vercel configuration
│   ├── package.json        # Dependencies
│   ├── icon.png           # Project icon
│   └── README.md          # This file
```

### Available Scripts
```bash
# Development
npm run dev

# Production
npm start

# Test
npm test
```

### Dependencies
- **Express.js**: Web framework
- **Axios**: HTTP client
- **CORS**: Cross-origin resource sharing
- **Helmet**: Security middleware
- **Morgan**: Logging middleware

## 🚀 Deployment

### Vercel Deployment
The API is configured for Vercel deployment:

1. Connect your GitHub repository to Vercel
2. The `vercel.json` configuration will handle the deployment
3. Environment variables can be set in Vercel dashboard

### Environment Variables for Vercel
```env
LASTFM_API_KEY=your_lastfm_api_key
NODE_ENV=production
```

## 🔒 Security Features

- **CORS Configuration**: Properly configured for cross-origin requests
- **Input Validation**: All inputs are validated and sanitized
- **Rate Limiting**: Built-in rate limiting (configurable)
- **Security Headers**: Helmet.js for security headers
- **Error Handling**: No sensitive information in error responses

## 📈 Performance Optimizations

- **Parallel Processing**: Multiple API calls run in parallel
- **Caching**: Instance data is cached to reduce API calls
- **Timeout Management**: Prevents hanging requests
- **Efficient Parsing**: Optimized JSON parsing and data extraction
- **Memory Management**: Proper cleanup of large responses

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
1. Check the existing issues on [GitHub](https://github.com/Shashwat-CODING/Muzo-backend/issues)
2. Create a new issue with detailed description
3. Include logs and request/response examples
4. Visit our [live demo](https://shashwat-coding.github.io/Muzo-backend) to test the API

## 🔗 Links

- **GitHub Repository:** [https://github.com/Shashwat-CODING/Muzo-backend](https://github.com/Shashwat-CODING/Muzo-backend)
- **Live Demo:** [https://shashwat-coding.github.io/Muzo-backend](https://shashwat-coding.github.io/Muzo-backend)
- **API Documentation:** Available in this README and through the live demo

## 🔄 Changelog

### v2.0.0
- Added Last.fm integration
- Added Saavn, Piped, and Invidious streaming
- Added channel feed endpoints
- Added album details endpoint
- Improved error handling and logging
- Added dynamic instance management

### v1.0.0
- Initial release with YouTube Music and YouTube Search
- Basic search and suggestion functionality
- RESTful API design

---

**Made with ❤️ by Shashwat for the Muzo community**
