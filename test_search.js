const { Innertube } = require('youtubei.js');

(async () => {
  try {
    const yt = await Innertube.create();
    const result = await yt.music.search('Bohemian Rhapsody');
    
    if (Array.isArray(result.contents)) {
      for (let i = 0; i < result.contents.length; i++) {
        const section = result.contents[i];
        
        if (section.contents && Array.isArray(section.contents)) {
          console.log(`\nSection ${i} (${section.type || 'Unknown'}) has ${section.contents.length} items:`);
          
          for (let j = 0; j < Math.min(5, section.contents.length); j++) {
            const item = section.contents[j];
            if (item.type === 'MusicResponsiveListItem' || item.type === 'Song' || item.type === 'Video') {
              let title = '';
              if (item.title?.text) {
                title = item.title.text;
              } else if (item.flex_columns && Array.isArray(item.flex_columns)) {
                title = item.flex_columns[0]?.text?.runs?.map(r => r.text).join('') || 'No title';
              }
              
              let videoId = '';
              if (item.endpoint?.watchEndpoint?.videoId) {
                videoId = item.endpoint.watchEndpoint.videoId;
              } else if (item.videoId) {
                videoId = item.videoId;
              }
              
              let artist = '';
              if (item.flex_columns && item.flex_columns.length > 1) {
                artist = item.flex_columns[1]?.text?.runs?.map(r => r.text).join(', ') || '';
              }
              
              console.log(`  - [${item.type}] "${title}" (ID: ${videoId}) by ${artist}`);
            }
          }
        }
      }
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
})();
