const puppeteer = require('puppeteer');

// Genesis 1:5 and 1:7 test
const sampleText = `5 und nannte das Licht Tag und die Finsternis Nacht. Da ward aus Abend und Morgen der erste Tag.

7 Da machte Gott die Feste und schied das Wasser unter der Feste von dem Wasser über der Feste. Und es geschah also.`;

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('Testing Genesis 1:5 and 1:7...');
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });

  await page.type('textarea', sampleText);

  const translateButton = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(btn => btn.textContent.includes('Translate'));
  });
  await translateButton.click();

  try {
    await page.waitForSelector('ruby, .word-unit', { timeout: 60000 });
  } catch (e) {
    console.log('Timeout!');
  }

  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({ path: 'screenshots/genesis-verses-test.png', fullPage: true });

  // Get all glosses
  const glossData = await page.evaluate(() => {
    const wordUnits = document.querySelectorAll('.word-unit');
    const results = {};
    wordUnits.forEach(unit => {
      const sourceTexts = unit.querySelectorAll('.source-text');
      const glossTexts = unit.querySelectorAll('.gloss-text');
      sourceTexts.forEach((src, idx) => {
        const word = src.textContent.toLowerCase();
        const gloss = glossTexts[idx]?.textContent || '';
        results[word] = gloss;
      });
    });
    return results;
  });

  console.log('\n--- Genesis 1:5 Test ---');
  console.log(`Tag -> ${glossData['tag'] || 'NOT FOUND'} (expected: DAY)`);
  console.log(`und -> ${glossData['und'] || 'NOT FOUND'} (expected: AND)`);
  console.log(`Nacht -> ${glossData['nacht'] || 'NOT FOUND'} (expected: NIGHT)`);

  const v5Pass = glossData['tag'] === 'DAY' &&
                 glossData['und'] === 'AND' &&
                 glossData['nacht'] === 'NIGHT';
  console.log(`Genesis 1:5 'Tag und Nacht': ${v5Pass ? '✅ PASS' : '❌ FAIL'}`);

  console.log('\n--- Genesis 1:7 Test ---');
  console.log(`über -> ${glossData['über'] || 'NOT FOUND'} (expected: OVER/ABOVE)`);
  console.log(`der -> ${glossData['der'] || 'NOT FOUND'} (expected: THE)`);
  console.log(`Feste -> ${glossData['feste'] || 'NOT FOUND'} (expected: FIRMAMENT/EXPANSE)`);

  const v7Pass = (glossData['über']?.includes('OVER') || glossData['über']?.includes('ABOVE')) &&
                 glossData['der'] === 'THE' &&
                 (glossData['feste']?.includes('FIRMAMENT') || glossData['feste']?.includes('EXPANSE'));
  console.log(`Genesis 1:7 'über der Feste': ${v7Pass ? '✅ PASS' : '❌ FAIL'}`);

  console.log('\n--- All Glosses Found ---');
  Object.entries(glossData).forEach(([word, gloss]) => {
    console.log(`  ${word}: ${gloss}`);
  });

  await browser.close();
})();
