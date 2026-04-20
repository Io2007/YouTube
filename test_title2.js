import('youtubei.js').then(async ({ Innertube }) => {
  try {
    const yt = await Innertube.create({ retrieve_player: false });
    const results = await yt.music.search('bruno mars');
    
    if (results.contents && Array.isArray(results.contents)) {
      // Get the MusicShelf section (usually index 1)
      const section = results.contents.find(s => s.type === 'MusicShelf');
      if (section && section.contents && Array.isArray(section.contents)) {
        const item = section.contents[0];
        
        console.log('=== ITEM STRUCTURE ===');
        console.log('Type:', item.type);
        console.log('ID:', item.id);
        
        console.log('\n=== FLEX_COLUMNS ===');
        if (item.flex_columns && Array.isArray(item.flex_columns)) {
          item.flex_columns.forEach((col, idx) => {
            console.log(`\nColumn ${idx}:`);
            console.log('  Keys:', Object.keys(col));
            console.log('  title:', col.title);
            if (col.title && typeof col.title === 'object') {
              if (col.title.runs && Array.isArray(col.title.runs)) {
                console.log('  runs:', JSON.stringify(col.title.runs, null, 2));
                console.log('  joined:', col.title.runs.map(r => r.text).join(''));
              } else if (col.title.text) {
                console.log('  text:', col.title.text);
              }
            }
          });
        }
        
        console.log('\n=== TITLE ===');
        console.log('title:', item.title);
      }
    }
    
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}).catch(e => {
  console.error('Import error:', e.message);
  process.exit(1);
});
