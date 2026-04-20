const express = require('express');
const { Innertube } = require('youtubei.js');

const router = express.Router();

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Search YouTube Music
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query string
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [songs, videos, albums, artists, playlists]
 *         description: Restrict results to a specific type
 *     responses:
 *       200:
 *         description: Search results
 *       400:
 *         description: Missing/invalid params
 */
router.get('/search', async (req, res) => {
  try {
    const { q: query, filter } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Missing required query parameter 'q'" });
    }

    const youtubeMusic = req.app.locals.youtubeMusic;

    if (!youtubeMusic) {
      return res.status(503).json({ error: 'YouTube Music client not initialized' });
    }

    // Perform search using youtubei.js
    const searchResults = await youtubeMusic.music.search(query, filter || undefined);

    // Normalize results
    const results = [];
    
    if (searchResults.contents) {
      for (const content of searchResults.contents) {
        if (content.type === 'MusicResponsiveListItem') {
          results.push({
            id: content.id?.replace('MPREb_', '') || content.videoId || '',
            videoId: content.videoId || '',
            title: content.title?.text || content.title?.runs?.map(r => r.text).join('') || '',
            artist: content.artists?.map(a => a.name).join(', ') || '',
            album: content.album?.name || '',
            duration: content.duration?.text || '',
            thumbnail: content.thumbnails?.[0]?.url || '',
            type: content.type
          });
        } else if (content.type === 'Song' || content.type === 'Video') {
          results.push({
            id: content.id || content.videoId || '',
            videoId: content.videoId || content.id || '',
            title: content.title?.text || content.title || '',
            artist: content.artists?.map(a => a.name).join(', ') || '',
            album: content.album?.name || '',
            duration: content.duration?.text || content.duration || '',
            thumbnail: content.thumbnails?.[0]?.url || '',
            type: content.type
          });
        } else if (content.type === 'Album' || content.type === 'Playlist' || content.type === 'Artist') {
          results.push({
            id: content.browseId || content.id || '',
            title: content.title?.text || content.title || '',
            artist: content.artists?.map(a => a.name).join(', ') || '',
            thumbnail: content.thumbnails?.[0]?.url || '',
            type: content.type
          });
        }
      }
    }

    res.json({
      query,
      filter: filter || null,
      results
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: `Search failed: ${error.message}` });
  }
});

/**
 * @swagger
 * /api/stream/:id:
 *   get:
 *     summary: Get streaming data for a video using Piped/Invidious
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID
 *     responses:
 *       200:
 *         description: Streaming data with formats
 *       400:
 *         description: Missing/invalid params
 *       404:
 *         description: Stream not found
 */
router.get('/stream/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
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

          return res.json({
            success: true,
            videoId: id,
            title: invidiousData.title || '',
            author: invidiousData.author || '',
            duration: invidiousData.lengthSeconds || 0,
            thumbnails: invidiousData.videoThumbnails ? invidiousData.videoThumbnails.map(t => ({ url: t.url })) : [],
            formats: audioFormats
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
        success: false,
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

    res.json({
      success: true,
      videoId: id,
      title: streamData.title || '',
      author: streamData.uploader || '',
      duration: streamData.duration || 0,
      thumbnails: streamData.thumbnailUrl ? [{ url: streamData.thumbnailUrl }] : [],
      formats: audioFormats
    });
  } catch (error) {
    console.error('Stream endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;
