import('youtubei.js').then(async ({ Innertube }) => {
  try {
    const yt = await Innertube.create({ retrieve_player: false });
    const results = await yt.music.search('bruno mars');
    
    if (results.contents && Array.isArray(results.contents)) {
      const section = results.contents[1]; // MusicShelf section
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
            if (col.text) {
              console.log('  text type:', typeof col.text);
              if (typeof col.text === 'string') {
                console.log('  text:', col.text);
              } else if (col.text.runs && Array.isArray(col.text.runs)) {
                console.log('  runs:', JSON.stringify(col.text.runs, null, 2));
                console.log('  joined:', col.text.runs.map(r => r.text).join(''));
              }
            }
          });
        }
        
        console.log('\n=== TITLE ===');
        console.log('title:', item.title);
        if (item.title && typeof item.title === 'object') {
          console.log('title keys:', Object.keys(item.title));
          console.log('title text:', item.title.text);
          console.log('title runs:', item.title.runs);
        }
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
