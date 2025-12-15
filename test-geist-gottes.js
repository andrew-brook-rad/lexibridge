const puppeteer = require('puppeteer');

// Genesis 1:2 with "der Geist Gottes"
const sampleText = `2 Und die Erde war wüst und leer, und es war finster auf der Tiefe; und der Geist Gottes schwebte auf dem Wasser.`;

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

  console.log('2. Filling in text with "der Geist Gottes"...');
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
  await page.screenshot({ path: 'screenshots/geist-gottes-test.png', fullPage: true });

  const allGlosses = await page.$$eval('rt, .gloss-text', els => els.map(el => el.textContent.trim().toUpperCase()));
  const sourceTexts = await page.$$eval('rb, .source-text', els => els.map(el => el.textContent.trim()));

  console.log('Source texts:', sourceTexts);
  console.log('Glosses:', allGlosses);

  console.log('\n=== VERIFICATION: der Geist Gottes ===');

  // Look for "der" (THE)
  const derIndex = sourceTexts.findIndex(t => t.toLowerCase() === 'der');
  if (derIndex >= 0) {
    console.log(`"der" -> "${allGlosses[derIndex]}" (expected: THE)`);
    console.log(allGlosses[derIndex].includes('THE') ? '  ✓ PASS' : '  ✗ FAIL');
  }

  // Look for "Geist" (SPIRIT)
  const geistIndex = sourceTexts.findIndex(t => t.toLowerCase() === 'geist');
  if (geistIndex >= 0) {
    console.log(`"Geist" -> "${allGlosses[geistIndex]}" (expected: SPIRIT)`);
    console.log(allGlosses[geistIndex].includes('SPIRIT') ? '  ✓ PASS' : '  ✗ FAIL');
  }

  // Look for "Gottes" (GOD'S or OF GOD)
  const gottesIndex = sourceTexts.findIndex(t => t.toLowerCase() === 'gottes');
  if (gottesIndex >= 0) {
    console.log(`"Gottes" -> "${allGlosses[gottesIndex]}" (expected: GOD'S or OF GOD)`);
    const gottesGloss = allGlosses[gottesIndex];
    console.log((gottesGloss.includes('GOD') || gottesGloss.includes("GOD'S")) ? '  ✓ PASS' : '  ✗ FAIL');
  }

  await browser.close();
  console.log('\nDone!');
})();
