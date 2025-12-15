const http = require('http');

const PORT = 3003;

// Test ge- prefix and three-part compounds
async function testCompounds() {
  console.log('=== Testing Compound Word Splitting ===\n');

  // Test ge- prefix (geschah, getan, geschrieben)
  console.log('1. Testing ge- prefix (geschah)...');
  const geResult = await sendTranslation('Und es geschah also.');
  if (geResult?.chapter?.paragraphs?.[0]) {
    const tokens = geResult.chapter.paragraphs[0];
    const geschahToken = tokens.find(t => t.type === 'word' && t.original_full?.toLowerCase() === 'geschah');
    if (geschahToken) {
      console.log('geschah found:', geschahToken.original_full);
      console.log('parts:', geschahToken.parts?.map(p => `${p.text} -> ${p.gloss}`).join(', '));
      console.log('Split count:', geschahToken.parts?.length);
    } else {
      console.log('geschah not found in response');
      console.log('Tokens:', tokens.filter(t => t.type === 'word').map(t => t.original_full).join(', '));
    }
  }

  // Test three-part compound (Himmelfahrt, Handschrift, Bundesrepublik)
  console.log('\n2. Testing three-part compound (Himmelfahrt - heaven+journey = Ascension)...');
  const threePartResult = await sendTranslation('Die Himmelfahrt Christi.');
  if (threePartResult?.chapter?.paragraphs?.[0]) {
    const tokens = threePartResult.chapter.paragraphs[0];
    const himmelfahrtToken = tokens.find(t => t.type === 'word' && t.original_full?.toLowerCase().includes('himmelfahrt'));
    if (himmelfahrtToken) {
      console.log('Himmelfahrt found:', himmelfahrtToken.original_full);
      console.log('parts:', himmelfahrtToken.parts?.map(p => `${p.text} -> ${p.gloss}`).join(', '));
      console.log('Split count:', himmelfahrtToken.parts?.length);
    } else {
      console.log('Himmelfahrt not found');
      console.log('Tokens:', tokens.filter(t => t.type === 'word').map(t => t.original_full).join(', '));
    }
  }

  // Another three-part test
  console.log('\n3. Testing Handschrift (hand+writing+letter = manuscript)...');
  const handschriftResult = await sendTranslation('Die Handschrift ist alt.');
  if (handschriftResult?.chapter?.paragraphs?.[0]) {
    const tokens = handschriftResult.chapter.paragraphs[0];
    const handschriftToken = tokens.find(t => t.type === 'word' && t.original_full?.toLowerCase().includes('handschrift'));
    if (handschriftToken) {
      console.log('Handschrift found:', handschriftToken.original_full);
      console.log('parts:', handschriftToken.parts?.map(p => `${p.text} -> ${p.gloss}`).join(', '));
      console.log('Split count:', handschriftToken.parts?.length);
    } else {
      console.log('Handschrift not found');
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

testCompounds();
