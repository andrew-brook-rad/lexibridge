const http = require('http');

// Test with Genesis 1:1-2 which has "Gottes" that should split
const testText = '1 Am Anfang schuf Gott Himmel und Erde. 2 Und die Erde war wüst und leer, und es war finster auf der Tiefe; und der Geist Gottes schwebte auf dem Wasser.';
const postData = JSON.stringify({ text: testText, chapterNumber: 1 });

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/translate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  let responseData = '';
  res.on('data', chunk => responseData += chunk);
  res.on('end', () => {
    console.log('API Status:', res.statusCode);
    try {
      const parsed = JSON.parse(responseData);
      const chapter = parsed.chapter;
      console.log('Chapter number:', chapter.number);
      console.log('Paragraphs:', chapter.paragraphs?.length);

      // Look for compound words (words with multiple parts)
      let compoundWords = [];
      chapter.paragraphs?.forEach(para => {
        para.forEach(token => {
          if (token.type === 'word' && token.parts?.length > 1) {
            compoundWords.push({
              original: token.original_full,
              parts: token.parts.map(p => p.text + ':' + p.gloss).join(' + ')
            });
          }
        });
      });

      console.log('\nCompound words found:', compoundWords.length);
      compoundWords.forEach(cw => {
        console.log('  -', cw.original, '->', cw.parts);
      });

      // Count totals
      let verseNums = 0, words = 0;
      chapter.paragraphs?.forEach(para => {
        para.forEach(token => {
          if (token.type === 'verse_num') verseNums++;
          if (token.type === 'word') words++;
        });
      });
      console.log('\nVerse numbers:', verseNums);
      console.log('Words:', words);

    } catch (e) {
      console.log('Parse error:', e.message);
    }
  });
});

req.on('error', e => console.log('API Error:', e.message));
req.write(postData);
req.end();
