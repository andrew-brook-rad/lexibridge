const http = require('http');

// Test that port 3001 responds with LexiBridge content
const req = http.get('http://localhost:3001', {timeout: 5000}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('HTTP Status:', res.statusCode);
    console.log('Content Length:', data.length, 'bytes');
    console.log('Contains LexiBridge:', data.includes('LexiBridge'));
    console.log('Contains interlinear:', data.includes('interlinear') || data.includes('Interlinear'));
    console.log('Contains Genesis:', data.includes('Genesis') || data.includes('genesis'));

    // Check for key UI elements
    console.log('\nKey UI Elements:');
    console.log('- Print Settings:', data.includes('Print Settings') || data.includes('print-settings'));
    console.log('- Word Spacing:', data.includes('Word Spacing') || data.includes('wordSpacing'));
    console.log('- PDF/Export:', data.includes('PDF') || data.includes('Export'));

    process.exit(0);
  });
});

req.on('error', (e) => {
  console.log('Error:', e.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.log('Request timed out');
  req.destroy();
  process.exit(1);
});
