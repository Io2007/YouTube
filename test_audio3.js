import('youtubei.js').then(async m => { 
  const yt = await m.Innertube.create({ retrieve_player: true, generate_session_locally: true }); 
  const info = await yt.music.getInfo('dQw4w9WgXcQ'); 
  
  // Try to get decrypted URL using youtubei.js helpers
  const audioFormats = info.streaming_data?.adaptive_formats?.filter(f => f.mime_type && f.mime_type.includes('audio')); 
  
  if (audioFormats && audioFormats.length > 0) {
    const format = audioFormats[0];
    console.log('Format:', { itag: format.itag, mime: format.mime_type, bitrate: format.bitrate });
    
    // Try to get URL using youtubei.js's internal method
    try {
      const url = format.decipher(yt.session.player);
      console.log('Deciphered URL:', url ? url.substring(0, 100) + '...' : 'none');
    } catch (e) {
      console.log('Decipher error:', e.message);
    }
  }
});
