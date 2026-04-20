import('youtubei.js').then(async ({ Innertube }) => {
  try {
    const yt = await Innertube.create({ retrieve_player: false });
    const results = await yt.music.search('bruno mars');
    
    console.log('=== TOP LEVEL ===');
    console.log('Contents length:', results.contents?.length);
    
    if (results.contents && Array.isArray(results.contents)) {
      results.contents.forEach((section, idx) => {
        console.log(`\n=== SECTION ${idx}: ${section.type} - ${section.title?.text || 'no title'} ===`);
        
        if (section.contents && Array.isArray(section.contents)) {
          section.contents.forEach((item, itemIdx) => {
            if (itemIdx >= 3) return; // only first 3 items
            
            console.log(`\n  Item ${itemIdx}: type=${item.type}`);
            
            // Get videoId from endpoint
            let videoId = '';
            let browseId = '';
            if (item.endpoint?.watchEndpoint?.videoId) {
              videoId = item.endpoint.watchEndpoint.videoId;
            } else if (item.endpoint?.browseEndpoint?.browseId) {
              browseId = item.endpoint.browseEndpoint.browseId;
            }
            
            // Get title from flex_columns
            let title = '';
            if (item.flex_columns && item.flex_columns.length > 0) {
              const runs = item.flex_columns[0]?.text?.runs;
              if (runs && Array.isArray(runs)) {
                title = runs.map(r => r.text).join('');
              }
            }
            
            // Also check simple title
            if (!title && item.title) {
              if (typeof item.title === 'string') {
                title = item.title;
              } else if (item.title?.text) {
                title = item.title.text;
              } else if (item.title?.runs) {
                title = item.title.runs.map(r => r.text).join('');
              }
            }
            
            // Check for artists in flex_columns[1]
            let artist = '';
            if (item.flex_columns && item.flex_columns.length > 1) {
              const runs = item.flex_columns[1]?.text?.runs;
              if (runs && Array.isArray(runs)) {
                artist = runs.map(r => r.text).join('');
              }
            }
            
            // Check for duration in fixed_columns
            let duration = '';
            if (item.fixed_columns && item.fixed_columns.length > 0) {
              duration = item.fixed_columns[0]?.text?.simpleText || '';
            }
            
            console.log(`    videoId: "${videoId}"`);
            console.log(`    browseId: "${browseId}"`);
            console.log(`    id: "${item.id}"`);
            console.log(`    title: "${title}"`);
            console.log(`    artist: "${artist}"`);
            console.log(`    duration: "${duration}"`);
          });
        }
      });
    }
    
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    console.error(e.stack);
    process.exit(1);
  }
}).catch(e => {
  console.error('Import error:', e.message);
  process.exit(1);
});
