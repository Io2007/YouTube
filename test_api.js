import app from './app.js';

// Simulate a search request
async function testSearch() {
  const req = {
    query: { q: 'bruno mars' },
    app: { locals: {} }
  };
  
  let responseBody = null;
  let responseStatus = null;
  
  const res = {
    status: (code) => {
      responseStatus = code;
      return res;
    },
    json: (data) => {
      responseBody = data;
    }
  };
  
  // Import the route handler
  const apiRoutes = await import('./routes/api.js');
  
  // Wait for YouTube Music to initialize
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Call the search route
  await apiRoutes.default(req, res, () => {});
  
  console.log('Status:', responseStatus);
  console.log('Response:', JSON.stringify(responseBody, null, 2));
  
  if (responseBody && responseBody.tracks) {
    console.log('\nTracks found:', responseBody.tracks.length);
    if (responseBody.tracks.length > 0) {
      console.log('First track:', responseBody.tracks[0]);
    }
  }
  
  process.exit(0);
}

testSearch().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
