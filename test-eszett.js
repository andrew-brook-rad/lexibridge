const puppeteer = require('puppeteer');

// Test text with German eszett (ß)
const sampleText = `4 Und Gott sah, daß das Licht gut war.`;

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('1. Navigating to http://localhost:3001...');
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle0' });

  // Clear any localStorage data first
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });

  console.log('2. Filling in sample text with eszett (ß)...');
  await page.type('textarea', sampleText);

  console.log('3. Clicking Translate button...');
  const translateButton = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(btn => btn.textContent.includes('Translate'));
  });
  await translateButton.click();

  // Wait for translation to complete
  console.log('4. Waiting for translation...');
  try {
    await page.waitForSelector('ruby, .word-unit', { timeout: 60000 });
    console.log('   Translation completed!');
  } catch (e) {
    console.log('   Timeout!');
  }

  await new Promise(r => setTimeout(r, 2000));

  console.log('5. Taking screenshot...');
  await page.screenshot({ path: 'screenshots/eszett-test.png', fullPage: true });

  // Check if daß is rendered correctly
  const pageContent = await page.content();
  const hasEszett = pageContent.includes('daß');
  console.log(`\nEszett (ß) rendered correctly: ${hasEszett ? 'PASS' : 'FAIL'}`);

  // Get the specific word with ß
  const wordData = await page.evaluate(() => {
    const wordUnits = document.querySelectorAll('.word-unit');
    const results = [];
    wordUnits.forEach(unit => {
      const sourceTexts = unit.querySelectorAll('.source-text');
      const glossTexts = unit.querySelectorAll('.gloss-text');
      sourceTexts.forEach((src, idx) => {
        if (src.textContent.includes('daß') || src.textContent.includes('ß')) {
          results.push({
            text: src.textContent,
            gloss: glossTexts[idx]?.textContent || ''
          });
        }
      });
    });
    return results;
  });

  if (wordData.length > 0) {
    console.log(`Found word with ß: ${JSON.stringify(wordData)}`);
    console.log('✅ German eszett (ß) renders correctly');
  } else {
    console.log('❌ Could not find word with ß in output');
  }

  await browser.close();
  console.log('\nDone!');
})();
