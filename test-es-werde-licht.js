const puppeteer = require('puppeteer');

// Genesis 1:3 with "Es werde Licht"
const sampleText = `3 Und Gott sprach: Es werde Licht! und es ward Licht.`;

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('1. Navigating to http://localhost:3002...');
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });

  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });

  console.log('2. Filling in text with "Es werde Licht"...');
  await page.type('textarea', sampleText);

  console.log('3. Clicking Translate button...');
  const translateButton = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(btn => btn.textContent.includes('Translate'));
  });
  await translateButton.click();

  console.log('4. Waiting for translation to complete...');
  try {
    await page.waitForSelector('ruby, .word-unit', { timeout: 60000 });
    console.log('   Translation completed!');
  } catch (e) {
    console.log('   Timeout waiting for translation');
  }

  await new Promise(r => setTimeout(r, 2000));

  console.log('5. Taking screenshot...');
  await page.screenshot({ path: 'screenshots/es-werde-licht-test.png', fullPage: true });

  const allGlosses = await page.$$eval('rt, .gloss-text', els => els.map(el => el.textContent.trim().toUpperCase()));
  const sourceTexts = await page.$$eval('rb, .source-text', els => els.map(el => el.textContent.trim()));

  console.log('Source texts:', sourceTexts);
  console.log('Glosses:', allGlosses);

  console.log('\n=== VERIFICATION: Es werde Licht ===');

  // Look for "Es" (IT/LET IT)
  const esIndex = sourceTexts.findIndex(t => t.toLowerCase() === 'es');
  if (esIndex >= 0) {
    console.log(`"Es" -> "${allGlosses[esIndex]}" (expected: IT/LET IT)`);
    const esGloss = allGlosses[esIndex];
    console.log((esGloss.includes('IT') || esGloss.includes('LET')) ? '  ✓ PASS' : '  ✗ FAIL');
  }

  // Look for "werde" (BECOME/BE)
  const werdeIndex = sourceTexts.findIndex(t => t.toLowerCase() === 'werde');
  if (werdeIndex >= 0) {
    console.log(`"werde" -> "${allGlosses[werdeIndex]}" (expected: BECOME/BE)`);
    const werdeGloss = allGlosses[werdeIndex];
    console.log((werdeGloss.includes('BECOME') || werdeGloss.includes('BE')) ? '  ✓ PASS' : '  ✗ FAIL');
  }

  // Look for "Licht" (LIGHT)
  const lichtIndex = sourceTexts.findIndex(t => t.toLowerCase() === 'licht');
  if (lichtIndex >= 0) {
    console.log(`"Licht" -> "${allGlosses[lichtIndex]}" (expected: LIGHT)`);
    console.log(allGlosses[lichtIndex].includes('LIGHT') ? '  ✓ PASS' : '  ✗ FAIL');
  }

  await browser.close();
  console.log('\nDone!');
})();
