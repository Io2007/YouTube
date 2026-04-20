import express from 'express';

const router = express.Router();

/**
 * @swagger
 * /search:
 *   get:
 *     summary: Search YouTube Music (Eclipse Addon format)
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query string
 *     responses:
 *       200:
 *         description: Search results in Eclipse Addon format
 */
router.get('/search', async (req, res) => {
  try {
    const { q: query } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Missing required query parameter 'q'" });
    }

    const youtubeMusic = req.app.locals.youtubeMusic;

    if (!youtubeMusic) {
      return res.status(503).json({ error: 'YouTube Music client not initialized' });
    }

    // Perform search using youtubei.js for Music
    const searchResults = await youtubeMusic.music.search(query);

    // Initialize result arrays
    const tracks = [];
    const albums = [];
    const artists = [];
    const playlists = [];
    
    // Handle different response structures from youtubei.js
    let contents = [];
    if (searchResults.contents && Array.isArray(searchResults.contents)) {
      contents = searchResults.contents;
    }
    
    // Iterate through sections
    for (const section of contents) {
      if (!section || !section.contents || !Array.isArray(section.contents)) continue;
      
      for (const item of section.contents) {
        if (!item) continue;
        
        // Extract title from flex_columns or title property
        let title = '';
        if (item.title?.text) {
          title = item.title.text;
        } else if (item.flex_columns && Array.isArray(item.flex_columns)) {
          title = item.flex_columns[0]?.text?.runs?.map(r => r.text).join('') || '';
        }
        
        // Extract thumbnail
        const thumbnail = item.thumbnail?.url || item.thumbnails?.[0]?.url || '';
        
        // Check for Song/Video types
        if (item.type === 'Song' || item.type === 'Video' || item.type === 'MusicResponsiveListItem') {
          // Try to get videoId from endpoint
          let videoId = '';
          if (item.endpoint?.watchEndpoint?.videoId) {
            videoId = item.endpoint.watchEndpoint.videoId;
          } else if (item.videoId) {
            videoId = item.videoId;
          } else if (item.id) {
            videoId = item.id;
          }
          
          // Extract duration
          let durationText = '';
          if (item.duration?.text) {
            durationText = item.duration.text;
          } else if (item.fixed_columns && Array.isArray(item.fixed_columns)) {
            durationText = item.fixed_columns[0]?.text?.simpleText || '';
          }
          const durationSeconds = parseDuration(durationText);
          
          // Extract artist from flex_columns[1]
          let artist = '';
          if (item.flex_columns && item.flex_columns.length > 1) {
            artist = item.flex_columns[1]?.text?.runs?.map(r => r.text).join(', ') || '';
          } else if (item.artists && Array.isArray(item.artists)) {
            artist = item.artists.map(a => a.name).join(', ');
          }
          
          // Extract album
          let album = '';
          if (item.album?.name) {
            album = item.album.name;
          } else if (item.flex_columns && item.flex_columns.length > 2) {
            album = item.flex_columns[2]?.text?.runs?.map(r => r.text).join(', ') || '';
          }
          
          // Only add if we have at least a videoId and title
          if (videoId && title) {
            tracks.push({
              id: videoId,
              videoId: videoId,
              title: title,
              artist: artist,
              album: album,
              duration: durationSeconds,
              artworkURL: thumbnail,
              format: 'mp3'
            });
          }
        }
        // Check for Album type
        else if (item.type === 'Album') {
          const browseId = item.browseId || item.id || '';
          if (browseId && title) {
            albums.push({
              id: browseId,
              title: title,
              artist: Array.isArray(item.artists) ? item.artists.map(a => a.name).join(', ') : '',
              artworkURL: thumbnail,
              trackCount: 0,
              year: ''
            });
          }
        }
        // Check for Artist type
        else if (item.type === 'Artist') {
          const browseId = item.browseId || item.id || '';
          if (browseId && title) {
            artists.push({
              id: browseId,
              name: title,
              artworkURL: thumbnail,
              genres: []
            });
          }
        }
        // Check for Playlist type
        else if (item.type === 'Playlist') {
          const browseId = item.browseId || item.id || '';
          if (browseId && title) {
            playlists.push({
              id: browseId,
              title: title,
              creator: item.author?.name || '',
              artworkURL: thumbnail,
              trackCount: 0
            });
          }
        }
      }
    }

    res.json({
      tracks,
      albums,
      artists,
      playlists
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: `Search failed: ${error.message}` });
  }
});

/**
 * Parse duration string to seconds
 */
function parseDuration(durationText) {
  if (!durationText) return 0;
  
  const parts = durationText.split(':').map(p => parseInt(p, 10));
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

/**
 * @swagger
 * /album/{id}:
 *   get:
 *     summary: Get album details (Eclipse Catalog endpoint)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Album browse ID
 *     responses:
 *       200:
 *         description: Album details with tracks
 */
router.get('/album/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Missing required parameter: id' });
    }

    const youtubeMusic = req.app.locals.youtubeMusic;

    if (!youtubeMusic) {
      return res.status(503).json({ error: 'YouTube Music client not initialized' });
    }

    // Get album details using youtubei.js
    const albumInfo = await youtubeMusic.music.getAlbum(id);

    if (!albumInfo) {
      return res.status(404).json({ error: 'Album not found' });
    }

    // Extract album metadata
    const title = albumInfo.title?.text || albumInfo.title || '';
    const artist = albumInfo.artists?.map(a => a.name).join(', ') || '';
    const year = albumInfo.year?.text || albumInfo.year || '';
    const trackCount = albumInfo.trackCount || 0;
    const thumbnail = albumInfo.thumbnail?.url || albumInfo.thumbnails?.[0]?.url || '';

    // Extract tracks
    const tracks = [];
    if (albumInfo.tracks && Array.isArray(albumInfo.tracks)) {
      for (const track of albumInfo.tracks) {
        const videoId = track.videoId || track.id || '';
        const trackTitle = track.title?.text || track.title || '';
        const durationText = track.duration?.text || track.duration || '';
        const durationSeconds = parseDuration(durationText);

        if (videoId && trackTitle) {
          tracks.push({
            id: videoId,
            videoId: videoId,
            title: trackTitle,
            artist: track.artists?.map(a => a.name).join(', ') || artist,
            album: title,
            duration: durationSeconds,
            artworkURL: thumbnail,
            format: 'mp3',
            trackNumber: track.trackNumber || tracks.length + 1
          });
        }
      }
    }

    res.json({
      id: id,
      title: title,
      artist: artist,
      year: year,
      trackCount: tracks.length,
      artworkURL: thumbnail,
      tracks: tracks
    });
  } catch (error) {
    console.error('Album endpoint error:', error);
    res.status(500).json({ error: `Album fetch failed: ${error.message}` });
  }
});

/**
 * @swagger
 * /artist/{id}:
 *   get:
 *     summary: Get artist details (Eclipse Catalog endpoint)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Artist browse ID
 *     responses:
 *       200:
 *         description: Artist details with top songs and albums
 */
router.get('/artist/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Missing required parameter: id' });
    }

    const youtubeMusic = req.app.locals.youtubeMusic;

    if (!youtubeMusic) {
      return res.status(503).json({ error: 'YouTube Music client not initialized' });
    }

    // Get artist details using youtubei.js
    const artistInfo = await youtubeMusic.music.getArtist(id);

    if (!artistInfo) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    // Extract artist metadata
    const name = artistInfo.name?.text || artistInfo.name || '';
    const description = artistInfo.description?.text || artistInfo.description || '';
    const thumbnail = artistInfo.thumbnail?.url || artistInfo.thumbnails?.[0]?.url || '';
    const subscribers = artistInfo.subscribers?.text || '';

    // Extract top songs
    const topSongs = [];
    if (artistInfo.songs && Array.isArray(artistInfo.songs)) {
      for (const song of artistInfo.songs.slice(0, 20)) {
        const videoId = song.videoId || song.id || '';
        const title = song.title?.text || song.title || '';
        const durationText = song.duration?.text || song.duration || '';
        const durationSeconds = parseDuration(durationText);

        if (videoId && title) {
          topSongs.push({
            id: videoId,
            videoId: videoId,
            title: title,
            artist: name,
            duration: durationSeconds,
            artworkURL: thumbnail,
            format: 'mp3'
          });
        }
      }
    }

    // Extract albums
    const albums = [];
    if (artistInfo.albums && Array.isArray(artistInfo.albums)) {
      for (const album of artistInfo.albums) {
        const browseId = album.browseId || album.id || '';
        const albumTitle = album.title?.text || album.title || '';
        const albumYear = album.year?.text || album.year || '';

        if (browseId && albumTitle) {
          albums.push({
            id: browseId,
            title: albumTitle,
            artist: name,
            year: albumYear,
            artworkURL: album.thumbnail?.url || album.thumbnails?.[0]?.url || ''
          });
        }
      }
    }

    res.json({
      id: id,
      name: name,
      description: description,
      artworkURL: thumbnail,
      subscribers: subscribers,
      topSongs: topSongs,
      albums: albums
    });
  } catch (error) {
    console.error('Artist endpoint error:', error);
    res.status(500).json({ error: `Artist fetch failed: ${error.message}` });
  }
});

/**
 * @swagger
 * /playlist/{id}:
 *   get:
 *     summary: Get playlist details (Eclipse Catalog endpoint)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Playlist browse ID
 *     responses:
 *       200:
 *         description: Playlist details with tracks
 */
router.get('/playlist/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Missing required parameter: id' });
    }

    const youtubeMusic = req.app.locals.youtubeMusic;

    if (!youtubeMusic) {
      return res.status(503).json({ error: 'YouTube Music client not initialized' });
    }

    // Get playlist details using youtubei.js
    const playlistInfo = await youtubeMusic.music.getPlaylist(id);

    if (!playlistInfo) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Extract playlist metadata
    const title = playlistInfo.title?.text || playlistInfo.title || '';
    const author = playlistInfo.author?.name || playlistInfo.author || '';
    const trackCount = playlistInfo.trackCount || 0;
    const thumbnail = playlistInfo.thumbnail?.url || playlistInfo.thumbnails?.[0]?.url || '';

    // Extract tracks
    const tracks = [];
    if (playlistInfo.tracks && Array.isArray(playlistInfo.tracks)) {
      for (const track of playlistInfo.tracks) {
        const videoId = track.videoId || track.id || '';
        const trackTitle = track.title?.text || track.title || '';
        const durationText = track.duration?.text || track.duration || '';
        const durationSeconds = parseDuration(durationText);

        if (videoId && trackTitle) {
          tracks.push({
            id: videoId,
            videoId: videoId,
            title: trackTitle,
            artist: track.artists?.map(a => a.name).join(', ') || '',
            album: track.album?.name || '',
            duration: durationSeconds,
            artworkURL: track.thumbnail?.url || thumbnail,
            format: 'mp3'
          });
        }
      }
    }

    res.json({
      id: id,
      title: title,
      creator: author,
      trackCount: tracks.length,
      artworkURL: thumbnail,
      tracks: tracks
    });
  } catch (error) {
    console.error('Playlist endpoint error:', error);
    res.status(500).json({ error: `Playlist fetch failed: ${error.message}` });
  }
});

/**
 * @swagger
 * /stream/:id:
 *   get:
 *     summary: Get streaming data for a video using Piped/Invidious (Eclipse Addon format)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID
 *     responses:
 *       200:
 *         description: Stream URL in Eclipse Addon format
 */
router.get('/stream/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      error: 'Missing required parameter: id is required'
    });
  }

  try {
    // Piped instances - static mirrors as priority fallback
    const pipedStaticMirrors = [
      'https://pipedapi.video',
      'https://cf.pipedapi.video',
      'https://vc.pipedapi.video',
      'https://re.pipedapi.video'
    ];

    let streamData = null;
    let lastError = null;

    // First, try to fetch dynamic official list from Kavin.rocks
    let pipedInstances = [...pipedStaticMirrors];
    try {
      const dynamicResponse = await fetch('https://piped-instances.kavin.rocks/', { timeout: 5000 });
      if (dynamicResponse.ok) {
        const dynamicInstances = await dynamicResponse.json();
        if (Array.isArray(dynamicInstances)) {
          const apiInstances = dynamicInstances
            .filter(inst => inst.api && !inst.cdn)
            .map(inst => inst.api_url)
            .filter(url => url && url.startsWith('https://'));
          // Prepend dynamic instances to the list
          pipedInstances = [...apiInstances, ...pipedStaticMirrors];
        }
      }
    } catch (err) {
      console.log('Could not fetch dynamic Piped instances, using static mirrors:', err.message);
    }

    // Try each Piped instance until one works
    for (const instance of pipedInstances) {
      try {
        const response = await fetch(`${instance}/streams/${id}`, { timeout: 5000 });

        if (!response.ok) {
          throw new Error(`Piped instance returned ${response.status}`);
        }

        streamData = await response.json();
        break;
      } catch (error) {
        lastError = error;
        console.log(`Piped instance ${instance} failed:`, error.message);
        continue;
      }
    }

    // If Piped failed, try Invidious as fallback (for regular YouTube videos)
    if (!streamData) {
      let invidiousInstances = [];
      try {
        const invidiousResponse = await fetch('https://api.invidious.io/instances', { timeout: 5000 });
        if (invidiousResponse.ok) {
          const allInstances = await invidiousResponse.json();
          if (Array.isArray(allInstances)) {
            invidiousInstances = allInstances
              .filter(inst => inst.api === true && inst.type === 'https')
              .map(inst => inst.uri)
              .filter(url => url && url.startsWith('https://'));
          }
        }
      } catch (err) {
        console.log('Could not fetch Invidious instances:', err.message);
      }

      // Try each Invidious instance
      for (const instance of invidiousInstances) {
        try {
          const response = await fetch(`${instance}/api/v1/videos/${id}`, { timeout: 5000 });

          if (!response.ok) {
            throw new Error(`Invidious instance returned ${response.status}`);
          }

          const invidiousData = await response.json();
          
          // Convert Invidious format to our expected format
          const audioFormats = [];
          if (invidiousData.formatStreams) {
            for (const format of invidiousData.formatStreams) {
              if (format.type && format.type.includes('audio')) {
                audioFormats.push({
                  itag: 0,
                  mimeType: format.type.split(';')[0],
                  bitrate: parseInt(format.bitrate) || 0,
                  audioQuality: 'AUDIO_QUALITY_MEDIUM',
                  url: format.url
                });
              }
            }
          }
          
          audioFormats.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

          // Return highest quality audio URL
          const bestFormat = audioFormats[0];
          return res.json({
            url: bestFormat ? bestFormat.url : '',
            format: bestFormat ? bestFormat.mimeType.replace('audio/', '') : 'mp3',
            quality: bestFormat ? `${Math.round(bestFormat.bitrate / 1000)}kbps` : 'medium'
          });
        } catch (error) {
          lastError = error;
          console.log(`Invidious instance ${instance} failed:`, error.message);
          continue;
        }
      }
    }

    if (!streamData) {
      return res.status(500).json({
        error: 'All Piped and Invidious instances failed',
        message: lastError?.message || 'Unknown error'
      });
    }

    // Extract audio formats from Piped response
    const audioFormats = [];
    
    if (streamData.audioStreams) {
      for (const format of streamData.audioStreams) {
        audioFormats.push({
          itag: format.itag || 0,
          mimeType: format.mimeType || 'audio/mp4',
          bitrate: format.bitrate || 0,
          audioQuality: format.quality || 'AUDIO_QUALITY_MEDIUM',
          url: format.url
        });
      }
    }

    // Sort formats by bitrate (highest first)
    audioFormats.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

    // Return highest quality audio URL
    const bestFormat = audioFormats[0];
    res.json({
      url: bestFormat ? bestFormat.url : '',
      format: bestFormat ? bestFormat.mimeType.replace('audio/', '') : 'mp3',
      quality: bestFormat ? `${Math.round(bestFormat.bitrate / 1000)}kbps` : 'medium'
    });
  } catch (error) {
    console.error('Stream endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

export default router;
