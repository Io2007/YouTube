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

      // Extract title from flex_columns or title property - UPDATED VERSION
      let title = '';
      if (item.title?.text) {
        title = item.title.text;
      } else if (item.flex_columns && Array.isArray(item.flex_columns)) {
        // Try col.title.runs first (new structure), then col.text.runs (old structure)
        const firstCol = item.flex_columns[0];
        if (firstCol?.title?.runs && Array.isArray(firstCol.title.runs)) {
          title = firstCol.title.runs.map(r => r.text).join('');
        } else if (firstCol?.text?.runs && Array.isArray(firstCol.text.runs)) {
          title = firstCol.text.runs.map(r => r.text).join('');
        } else if (firstCol?.title?.text) {
          title = firstCol.title.text;
        } else if (firstCol?.text) {
          title = firstCol.text;
        }
      }

      // Get the ID - use item.id directly as the primary source
      const id = item.id || '';
      
      // Determine type based on ID prefix and item properties
      const isAlbum = id.startsWith('MPREb_');
      const isPlaylist = id.startsWith('VLPL') || id.startsWith('RDCLAK5uy');
      const isArtist = id.startsWith('UC') || id.startsWith('MPCG');
      const isSong = !isAlbum && !isPlaylist && !isArtist && id.length >= 10;

      console.log(`Item: type=${item.type}, id=${id}, title="${title}", isSong=${isSong}, isAlbum=${isAlbum}`);

      // Check for Song/Video types
      if (isSong && id && title) {
        tracks.push({ id: id, videoId: id, title: title });
      }
      // Check for Album type
      else if (isAlbum && id && title) {
        albums.push({ id: id, title: title });
      }
      // Check for Artist type
      else if (isArtist && id && title) {
        artists.push({ id: id, name: title });
      }
      // Check for Playlist type
      else if (isPlaylist && id && title) {
        playlists.push({ id: id, title: title });
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
