import('youtubei.js').then(async ({ Innertube }) => {
  try {
    const yt = await Innertube.create({ retrieve_player: false });
    const results = await yt.music.search('bruno mars');
    console.log('Keys:', Object.keys(results));
    console.log('Has contents:', !!results.contents);
    console.log('Has results:', !!results.results);
    if (results.results && Array.isArray(results.results)) {
      console.log('Results count:', results.results.length);
      if (results.results[0]) {
        console.log('First result type:', results.results[0].type);
        console.log('First result keys:', Object.keys(results.results[0]));
      }
    }
    if (results.contents) {
      console.log('Contents is array:', Array.isArray(results.contents));
      console.log('Contents length:', results.contents?.length);
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
