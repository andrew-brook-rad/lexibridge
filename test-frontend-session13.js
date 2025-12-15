const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let responseData = '';
  res.on('data', chunk => responseData += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Content type:', res.headers['content-type']);

    // Check if page contains expected content
    const hasTitle = responseData.includes('LexiBridge');
    const hasReactRoot = responseData.includes('__next') || responseData.includes('root');
    const hasPageContent = responseData.includes('interlinear') || responseData.includes('text-align');

    console.log('Has LexiBridge title:', hasTitle);
    console.log('Has Next.js root:', hasReactRoot);
    console.log('Page length:', responseData.length, 'bytes');

    if (res.statusCode === 200 && responseData.length > 1000) {
      console.log('\nTest PASSED: Frontend page loads correctly');
    } else {
      console.log('\nTest FAILED: Frontend page issue');
    }
  });
});

req.on('error', e => console.log('Error:', e.message));
req.end();
