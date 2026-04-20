import { Innertube } from 'youtubei.js';

(async () => {
  try {
    const yt = await Innertube.create();
    const result = await yt.music.search('Bohemian Rhapsody');

    console.log('=== Search Results ===\n');

    if (result.contents && result.contents.length > 0) {
      let songCount = 0;

      for (let i = 0; i < result.contents.length; i++) {
        const section = result.contents[i];

        if (section.contents && section.contents.length > 0) {
          for (let j = 0; j < section.contents.length; j++) {
            const item = section.contents[j];

            if (item.type === 'MusicResponsiveListItem' || item.type === 'Song') {
              // Extract title from flex_columns[0].title.text
              let title = '';
              if (item.flex_columns && Array.isArray(item.flex_columns)) {
                const firstCol = item.flex_columns[0];
                if (firstCol?.title?.text) {
                  title = firstCol.title.text;
                } else if (firstCol?.title?.runs) {
                  title = firstCol.title.runs.map(r => r.text).join('');
                }
              }

              // Extract videoId - prefer watchEndpoint
              let videoId = '';
              if (item.endpoint?.watchEndpoint?.videoId) {
                videoId = item.endpoint.watchEndpoint.videoId;
              } else if (item.videoId) {
                videoId = item.videoId;
              }
              
              // Skip non-video items
              if (!videoId || videoId.startsWith('UC') || videoId.startsWith('MPREb')) {
                continue;
              }

              // Extract artist from flex_columns[1] or artists array
              let artist = '';
              if (item.artists && Array.isArray(item.artists)) {
                artist = item.artists.map(a => a.name).join(', ');
              } else if (item.authors && Array.isArray(item.authors)) {
                artist = item.authors.map(a => a.name).join(', ');
              } else if (item.flex_columns && item.flex_columns.length > 1) {
                const secondCol = item.flex_columns[1];
                if (secondCol?.title?.runs) {
                  artist = secondCol.title.runs
                    .filter(r => r.text && !r.bold)
                    .map(r => r.text)
                    .join('');
                }
              }
              
              // Skip if artist contains "Artist" or "Album" keywords
              if (artist.includes('Artist') || artist.includes('Album')) {
                continue;
              }

              // Extract duration
              let duration = '';
              if (item.duration?.text) {
                duration = item.duration.text;
              } else if (item.fixed_columns && Array.isArray(item.fixed_columns)) {
                duration = item.fixed_columns[0]?.text?.simpleText || '';
              }

              // Only show actual songs
              if (videoId && title) {
                songCount++;
                console.log(`${songCount}. "${title}" by ${artist} (${duration}) [ID: ${videoId}]`);

                if (songCount >= 10) break;
              }
            }
          }
        }

        if (songCount >= 10) break;
      }

      console.log(`\nTotal songs found: ${songCount}`);
    }
  } catch (e) {
    console.error('Error:', e.message);
    console.error(e.stack);
  }
})();
