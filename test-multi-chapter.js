const http = require('http');

const PORT = 3003;

// Multi-chapter text
const MULTI_CHAPTER_TEXT = `Chapter 1
1 Am Anfang schuf Gott Himmel und Erde. 2 Und Gott sprach: Es werde Licht!

Chapter 2
1 Also ward vollendet Himmel und Erde. 2 Und Gott segnete den siebenten Tag.`;

// Test the multi-chapter API
async function testMultiChapterAPI() {
  console.log('=== Testing Multi-Chapter Support ===\n');

  // First test that single chapter text still works
  console.log('1. Testing single chapter text...');
  const singleResponse = await sendTranslation('1 Am Anfang schuf Gott.');
  console.log('Single chapter result:', singleResponse ? 'OK' : 'FAILED');

  // Now test multi-chapter
  console.log('\n2. Testing multi-chapter text...');
  console.log('Input text:\n', MULTI_CHAPTER_TEXT.substring(0, 100) + '...\n');

  // Simulating what the frontend does - splitting chapters
  const chapters = splitIntoChapters(MULTI_CHAPTER_TEXT);
  console.log('Detected chapters:', chapters.length);
  chapters.forEach(c => {
    console.log(`  - Chapter ${c.chapterNumber}: "${c.text.substring(0, 50)}..."`);
  });

  // Call API for each chapter
  const results = [];
  for (const chapter of chapters) {
    const result = await sendChapterTranslation(chapter.text, chapter.chapterNumber);
    if (result) {
      results.push(result);
      console.log(`\nChapter ${chapter.chapterNumber} translation result:`);
      console.log(`  - Number: ${result.chapter.number}`);
      console.log(`  - Paragraphs: ${result.chapter.paragraphs?.length}`);
      if (result.chapter.paragraphs?.[0]) {
        const wordTokens = result.chapter.paragraphs[0].filter(t => t.type === 'word');
        console.log(`  - First paragraph words: ${wordTokens.length}`);
        console.log(`  - First word: ${wordTokens[0]?.original_full} -> ${wordTokens[0]?.parts?.map(p => p.gloss).join(' + ')}`);
      }
    }
  }

  console.log('\n=== Results ===');
  console.log('Chapters translated:', results.length);
  console.log('Chapter 1 number:', results[0]?.chapter?.number);
  console.log('Chapter 2 number:', results[1]?.chapter?.number);

  const success = results.length === 2 &&
                  results[0]?.chapter?.number === 1 &&
                  results[1]?.chapter?.number === 2;
  console.log('\nMulti-chapter test:', success ? 'PASS' : 'FAIL');

  return success;
}

// Helper function to split text into chapters (mimics frontend logic)
function splitIntoChapters(text) {
  const chapterPattern = /(?:^|\n)\s*(?:CHAPTER|Chapter|Kapitel|KAPITEL)\s+(\d+)\s*[:\.]?\s*/gi;
  const chapters = [];
  const matches = [];

  let match;
  while ((match = chapterPattern.exec(text)) !== null) {
    matches.push({ index: match.index, chapterNumber: parseInt(match[1], 10) });
  }

  if (matches.length === 0) {
    return [{ chapterNumber: 1, text: text.trim() }];
  }

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
    const chapterText = text.substring(start, end)
      .replace(/^\s*(?:CHAPTER|Chapter|Kapitel|KAPITEL)\s+\d+\s*[:\.]?\s*/i, '')
      .trim();

    if (chapterText.length > 0) {
      chapters.push({ chapterNumber: matches[i].chapterNumber, text: chapterText });
    }
  }

  return chapters;
}

function sendTranslation(text) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ text, chapterNumber: 1 });

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
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          console.log('API Error:', data);
          resolve(null);
        }
      });
    });

    req.on('error', (e) => {
      console.log('Request error:', e.message);
      resolve(null);
    });

    req.write(postData);
    req.end();
  });
}

function sendChapterTranslation(text, chapterNumber) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ text, chapterNumber });

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
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          console.log('API Error for chapter', chapterNumber + ':', data);
          resolve(null);
        }
      });
    });

    req.on('error', (e) => {
      console.log('Request error:', e.message);
      resolve(null);
    });

    req.write(postData);
    req.end();
  });
}

testMultiChapterAPI().then(success => {
  process.exit(success ? 0 : 1);
});
