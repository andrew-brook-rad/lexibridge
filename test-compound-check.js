const http = require('http');

const PORT = 3003;

const postData = JSON.stringify({
  text: '1 Am Anfang schuf Gott Himmel und Erde. 2 Und die Erde war wüst und leer, und es war finster auf der Tiefe; und der Geist Gottes schwebte auf dem Wasser.',
  sourceLanguage: 'German',
  targetLanguage: 'English'
});

const options = {
  hostname: 'localhost',
  port: PORT,
  path: '/api/translate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);

    try {
      const json = JSON.parse(data);
      const chapter = json.chapter;

      console.log('Chapter number:', chapter.number);
      console.log('Paragraphs:', chapter.paragraphs?.length || 0);

      // Count tokens and find compound words
      let verseCount = 0;
      let wordCount = 0;
      let compoundWords = [];

      chapter.paragraphs?.forEach(para => {
        para.forEach(token => {
          if (token.type === 'verse_num') verseCount++;
          if (token.type === 'word') {
            wordCount++;
            if (token.parts && token.parts.length > 1) {
              compoundWords.push({
                original: token.original_full,
                parts: token.parts.map(p => p.text + ' (' + p.gloss + ')').join(' + ')
              });
            }
          }
        });
      });

      console.log('Verse numbers:', verseCount);
      console.log('Word tokens:', wordCount);
      console.log('Compound words found:', compoundWords.length);

      if (compoundWords.length > 0) {
        console.log('\nCompound word details:');
        compoundWords.forEach(cw => {
          console.log(`  "${cw.original}" -> ${cw.parts}`);
        });
      }

      console.log('\n=== LEGO METHOD TEST ===');
      if (compoundWords.length > 0) {
        console.log('SUCCESS: Compound words are being split!');
      } else {
        console.log('NOTE: No compound words found in this sample');
      }

    } catch (e) {
      console.log('Error:', e.message);
      console.log('Raw:', data.substring(0, 500));
    }
  });
});

req.on('error', (e) => {
  console.log('Error:', e.message);
});

req.write(postData);
req.end();
