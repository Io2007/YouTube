import('youtubei.js').then(async ({ Innertube }) => {
  try {
    const yt = await Innertube.create({ retrieve_player: false });
    const results = await yt.music.search('bruno mars');
    
    console.log('=== TOP LEVEL ===');
    console.log('Keys:', Object.keys(results));
    console.log('Contents length:', results.contents?.length);
    
    if (results.contents && Array.isArray(results.contents)) {
      results.contents.forEach((section, idx) => {
        console.log(`\n=== SECTION ${idx} ===`);
        console.log('Type:', section.type);
        console.log('Title:', section.title?.text);
        console.log('Has contents:', !!section.contents);
        console.log('Contents is array:', Array.isArray(section.contents));
        console.log('Contents length:', section.contents?.length);
        
        if (section.contents && Array.isArray(section.contents) && section.contents.length > 0) {
          const first = section.contents[0];
          console.log('\n--- First item ---');
          console.log('Type:', first.type);
          console.log('Keys:', Object.keys(first));
          
          if (first.type === 'Song' || first.type === 'Video') {
            console.log('videoId:', first.videoId);
            console.log('title:', first.title?.text || first.title);
          }
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
