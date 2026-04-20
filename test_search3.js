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
            if (itemIdx >= 2) return; // only first 2 items
            
            console.log(`\n  Item ${itemIdx}: type=${item.type}`);
            
            // Get videoId from endpoint
            let videoId = '';
            if (item.endpoint?.watchEndpoint?.videoId) {
              videoId = item.endpoint.watchEndpoint.videoId;
            } else if (item.endpoint?.browseEndpoint?.browseId) {
              videoId = item.endpoint.browseEndpoint.browseId;
            }
            
            // Get title from flex_columns
            let title = '';
            if (item.flex_columns && item.flex_columns.length > 0) {
              title = item.flex_columns[0]?.text?.runs?.map(r => r.text).join('') || '';
            }
            
            console.log(`    videoId: ${videoId}`);
            console.log(`    title: ${title}`);
            console.log(`    id: ${item.id}`);
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
