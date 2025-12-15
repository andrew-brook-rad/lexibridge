const http = require('http');

const PORT = 3003;

async function testThreePart() {
  console.log('=== Testing Three-Part Compound Splitting ===\n');

  // Test Unabhängigkeit (un + abhängig + keit)
  console.log('1. Testing Unabhängigkeit...');
  const result1 = await sendTranslation('Die Unabhängigkeit des Volkes.');
  if (result1?.chapter?.paragraphs?.[0]) {
    const tokens = result1.chapter.paragraphs[0];
    const token = tokens.find(t => t.type === 'word' && t.original_full?.toLowerCase().includes('unabhängigkeit'));
    if (token) {
      console.log('Found:', token.original_full);
      console.log('Parts:', token.parts?.map(p => `${p.text} -> ${p.gloss}`).join(', '));
      console.log('Split count:', token.parts?.length);
    } else {
      console.log('Not found');
    }
  }

  // Test Bundesrepublik (Bundes + republik)
  console.log('\n2. Testing Bundesrepublik...');
  const result2 = await sendTranslation('Die Bundesrepublik Deutschland.');
  if (result2?.chapter?.paragraphs?.[0]) {
    const tokens = result2.chapter.paragraphs[0];
    const token = tokens.find(t => t.type === 'word' && t.original_full?.toLowerCase().includes('bundesrepublik'));
    if (token) {
      console.log('Found:', token.original_full);
      console.log('Parts:', token.parts?.map(p => `${p.text} -> ${p.gloss}`).join(', '));
      console.log('Split count:', token.parts?.length);
    }
  }

  // Test Weihnachtsbaum (Weihnachts + baum)
  console.log('\n3. Testing Weihnachtsbaum (Christmas tree)...');
  const result3 = await sendTranslation('Der Weihnachtsbaum ist groß.');
  if (result3?.chapter?.paragraphs?.[0]) {
    const tokens = result3.chapter.paragraphs[0];
    const token = tokens.find(t => t.type === 'word' && t.original_full?.toLowerCase().includes('weihnachtsbaum'));
    if (token) {
      console.log('Found:', token.original_full);
      console.log('Parts:', token.parts?.map(p => `${p.text} -> ${p.gloss}`).join(', '));
      console.log('Split count:', token.parts?.length);
    }
  }
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

testThreePart();
