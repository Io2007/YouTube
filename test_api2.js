import { ensureYouTubeMusicInitialized } from './app.js';

// Simulate a search request
async function testSearch() {
  // Wait for YouTube Music to initialize
  const youtubeMusic = await ensureYouTubeMusicInitialized();
  
  if (!youtubeMusic) {
    console.error('Failed to initialize YouTube Music');
    process.exit(1);
  }
  
  console.log('YouTube Music initialized, performing search...');
  
  // Perform search
  const searchResults = await youtubeMusic.music.search('bruno mars');
  
  console.log('Search completed!');
  console.log('Keys:', Object.keys(searchResults));
  console.log('Contents length:', searchResults.contents?.length);
  
  // Initialize result arrays
  const tracks = [];
  const albums = [];
  const artists = [];
  const playlists = [];
  
  // Process contents
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
      
      // Get the ID - use item.id directly as the primary source
      const id = item.id || '';
      
      // Determine type based on ID prefix and item properties
      const isAlbum = id.startsWith('MPREb_');
      const isPlaylist = id.startsWith('VLPL') || id.startsWith('RDCLAK5uy');
      const isArtist = id.startsWith('UC') || id.startsWith('MPCG');
      const isSong = !isAlbum && !isPlaylist && !isArtist && id.length >= 10;

      console.log(`Item: type=${item.type}, id=${id}, title="${title}", isSong=${isSong}, isAlbum=${isAlbum}`);

      // Check for Song/Video types
      if (isSong) {
        // Extract duration
        let durationText = '';
        if (item.duration?.text) {
          durationText = item.duration.text;
        } else if (item.fixed_columns && Array.isArray(item.fixed_columns)) {
          durationText = item.fixed_columns[0]?.text?.simpleText || '';
        }
        
        // Extract artist from flex_columns[1]
        let artist = '';
        if (item.flex_columns && item.flex_columns.length > 1) {
          artist = item.flex_columns[1]?.text?.runs?.map(r => r.text).join(', ') || '';
        }

        // Only add if we have at least an id and title
        if (id && title) {
          tracks.push({
            id: id,
            videoId: id,
            title: title,
            artist: artist,
            duration: durationText,
            artworkURL: thumbnail
          });
        }
      }
      // Check for Album type
      else if (isAlbum) {
        if (id && title) {
          albums.push({ id: id, title: title, artworkURL: thumbnail });
        }
      }
      // Check for Artist type
      else if (isArtist) {
        if (id && title) {
          artists.push({ id: id, name: title, artworkURL: thumbnail });
        }
      }
      // Check for Playlist type
      else if (isPlaylist) {
        if (id && title) {
          playlists.push({ id: id, title: title, artworkURL: thumbnail });
        }
      }
    }
  }
  
  console.log('\n=== RESULTS ===');
  console.log('Tracks:', tracks.length);
  console.log('Albums:', albums.length);
  console.log('Artists:', artists.length);
  console.log('Playlists:', playlists.length);
  
  if (tracks.length > 0) {
    console.log('\nFirst track:', JSON.stringify(tracks[0], null, 2));
  }
  if (albums.length > 0) {
    console.log('\nFirst album:', JSON.stringify(albums[0], null, 2));
  }
  
  process.exit(0);
}

testSearch().catch(err => {
  console.error('Error:', err.message);
  console.error(err.stack);
  process.exit(1);
});
