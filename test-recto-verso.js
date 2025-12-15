const http = require('http');

// Test that the HTML contains recto/verso toggle elements
function testRectoVersoUI() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3000', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Testing Recto/Verso UI...');

        // Check for recto/verso toggle buttons
        const hasRectoButton = data.includes('Recto (Odd)');
        const hasVersoButton = data.includes('Verso (Even)');
        const hasInnerMarginText = data.includes('Inner margin on left') || data.includes('Inner margin on right');

        console.log('- Has Recto button:', hasRectoButton);
        console.log('- Has Verso button:', hasVersoButton);
        console.log('- Has margin text:', hasInnerMarginText);

        if (hasRectoButton && hasVersoButton && hasInnerMarginText) {
          console.log('\n✓ Recto/Verso UI elements are present');
          resolve(true);
        } else {
          console.log('\n✗ Missing Recto/Verso UI elements');
          resolve(false);
        }
      });
    }).on('error', reject);
  });
}

testRectoVersoUI()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
