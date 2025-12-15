const http = require('http');

// Test with compound words that should be split
const testText = '1 Am Anfang schuf Gott Himmel und Erde. 2 Und die Erde war wüst und leer, und es war finster auf der Tiefe; und der Geist Gottes schwebte auf dem Wasser.';

const data = JSON.stringify({
  text: testText,
  chapterNumber: 1
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/translate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let responseData = '';
  res.on('data', chunk => responseData += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      const parsed = JSON.parse(responseData);

      // Verify structure
      console.log('\n=== VERIFICATION RESULTS ===\n');
      console.log('✓ Chapter number:', parsed.chapter?.number);
      console.log('✓ Paragraphs count:', parsed.chapter?.paragraphs?.length);

      // Check for verse numbers
      const allTokens = parsed.chapter?.paragraphs?.flat() || [];
      const verseNums = allTokens.filter(t => t.type === 'verse_num');
      console.log('✓ Verse numbers found:', verseNums.length);

      // Check for word tokens with parts
      const wordTokens = allTokens.filter(t => t.type === 'word');
      console.log('✓ Word tokens found:', wordTokens.length);

      // Check for glosses
      const allParts = wordTokens.flatMap(w => w.parts || []);
      const glossCount = allParts.filter(p => p.gloss).length;
      console.log('✓ Glosses found:', glossCount);

      // Check for any compound words that were split
      const splitWords = wordTokens.filter(w => w.parts?.length > 1);
      console.log('✓ Split compound words:', splitWords.length);
      if (splitWords.length > 0) {
        splitWords.forEach(w => {
          console.log(`  - "${w.original_full}" -> [${w.parts.map(p => p.text).join(', ')}]`);
        });
      }

      console.log('\n=== FULL RESPONSE ===\n');
      console.log(JSON.stringify(parsed, null, 2));

    } catch (e) {
      console.log('Parse error:', e.message);
      console.log('Raw response:', responseData.substring(0, 1000));
    }
  });
});

req.on('error', e => {
  console.log('Error:', e.message);
  console.log('\n⚠️  Make sure the server is running: npm run dev');
});

req.write(data);
req.end();
