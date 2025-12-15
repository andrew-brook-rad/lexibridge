const puppeteer = require('puppeteer');

const sampleText = `1 Am Anfang schuf Gott Himmel und Erde. 2 Und die Erde war wüst und leer, und es war finster auf der Tiefe; und der Geist Gottes schwebte auf dem Wasser. 3 Und Gott sprach: Es werde Licht! und es ward Licht.`;

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('1. Navigating to http://localhost:3002...');
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });

  // Clear any localStorage data first
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });

  console.log('2. Taking initial screenshot...');
  await page.screenshot({ path: 'screenshots/verify-01-initial.png', fullPage: true });

  console.log('3. Filling in sample text...');
  await page.type('textarea', sampleText);

  console.log('4. Clicking Translate button...');
  const translateButton = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(btn => btn.textContent.includes('Translate'));
  });
  await translateButton.click();

  // Wait for translation to complete - check for ruby elements or word units
  console.log('5. Waiting for translation to complete (up to 60 seconds)...');
  try {
    await page.waitForSelector('ruby, .word-unit', { timeout: 60000 });
    console.log('   Translation completed!');
  } catch (e) {
    console.log('   Timeout waiting for translation, taking screenshot anyway...');
  }

  // Additional wait for rendering
  await new Promise(r => setTimeout(r, 2000));

  console.log('6. Taking screenshot after translation...');
  await page.screenshot({ path: 'screenshots/verify-02-translated.png', fullPage: true });

  // Check if interlinear text is rendered
  const hasRuby = await page.$('ruby') !== null;
  console.log('Has ruby elements (interlinear text):', hasRuby);

  // Check verse numbers
  const verseNumbers = await page.$$eval('.verse-number', els => els.map(el => el.textContent)).catch(() => []);
  console.log('Verse numbers found:', verseNumbers);

  // Check for word units
  const wordUnits = await page.$$eval('.word-unit', els => els.length).catch(() => 0);
  console.log('Word units found:', wordUnits);

  // Check glosses
  const glosses = await page.$$eval('rt', els => els.slice(0, 5).map(el => el.textContent)).catch(() => []);
  console.log('First 5 glosses:', glosses);

  // Test page size change
  console.log('7. Changing page size to 5.5x8.5...');
  await page.select('select', '5.5x8.5');
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'screenshots/verify-03-page-changed.png', fullPage: true });

  await browser.close();
  console.log('Done! Verification screenshots saved.');
})();
