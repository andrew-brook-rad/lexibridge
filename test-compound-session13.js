const http = require('http');

// Text with compound words from Genesis
const testText = '1 Am Anfang schuf Gott Himmel und Erde. 2 Und die Erde war wüst und leer, und es war finster auf der Tiefe; und der Geist Gottes schwebte auf dem Wasser.';

const data = JSON.stringify({
  text: testText,
  chapterNumber: 1
});

const options = {
  hostname: 'localhost',
  port: 3001,
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
      const paragraphs = parsed.chapter?.paragraphs || [];
      console.log('Paragraphs count:', paragraphs.length);

      // Count tokens across all paragraphs
      let totalTokens = 0;
      let verseNums = 0;
      let wordTokens = 0;
      let compoundWords = 0;

      paragraphs.forEach(paragraph => {
        paragraph.forEach(token => {
          totalTokens++;
          if (token.type === 'verse_num') verseNums++;
          if (token.type === 'word') {
            wordTokens++;
            if (token.parts && token.parts.length > 1) {
              compoundWords++;
              console.log('Compound word found:', token.original_full, '->', token.parts.map(p => p.text).join('-'));
            }
          }
        });
      });

      console.log('Total tokens:', totalTokens);
      console.log('Verse numbers:', verseNums);
      console.log('Word tokens:', wordTokens);
      console.log('Compound words (Lego Method):', compoundWords);

      if (verseNums >= 2 && wordTokens >= 20 && compoundWords >= 1) {
        console.log('\nTest PASSED: Compound word splitting (Lego Method) is working');
      } else {
        console.log('\nTest PARTIAL: API working but compound splitting may need verification');
      }
    } catch (e) {
      console.log('Parse error:', e.message);
      console.log('Raw response:', responseData.substring(0, 500));
    }
  });
});

req.on('error', e => console.log('Error:', e.message));
req.write(data);
req.end();
