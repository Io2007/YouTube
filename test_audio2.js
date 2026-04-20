import('youtubei.js').then(async m => { 
  const yt = await m.Innertube.create({ retrieve_player: true, generate_session_locally: true }); 
  const info = await yt.music.getInfo('dQw4w9WgXcQ'); 
  const audioFormats = info.streaming_data?.adaptive_formats?.filter(f => f.mime_type && f.mime_type.includes('audio')); 
  console.log(audioFormats?.slice(0, 3).map(f => ({ 
    itag: f.itag, 
    mime: f.mime_type, 
    bitrate: f.bitrate, 
    sigCipher: f.signature_cipher ? f.signature_cipher.substring(0, 100) + '...' : 'none'
  }))); 
});
