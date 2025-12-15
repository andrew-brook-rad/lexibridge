const puppeteer = require('puppeteer');

const sampleText = `1 Am Anfang schuf Gott Himmel und Erde. 2 Und die Erde war wüst und leer, und es war finster auf der Tiefe; und der Geist Gottes schwebte auf dem Wasser. 3 Und Gott sprach: Es werde Licht! und es ward Licht.`;

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

  console.log('2. Taking initial screenshot...');
  await page.screenshot({ path: 'screenshots/01-initial.png', fullPage: true });

  console.log('3. Filling in sample text...');
  await page.type('textarea', sampleText);
  await page.screenshot({ path: 'screenshots/02-text-entered.png', fullPage: true });

  console.log('4. Clicking Translate button...');
  // Find and click button containing "Translate" text
  const translateButton = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(btn => btn.textContent.includes('Translate'));
  });
  await translateButton.click();

  // Wait for response - just wait a fixed amount of time for now
  console.log('5. Waiting for translation (30 seconds max)...');
  await new Promise(r => setTimeout(r, 30000));

  console.log('6. Taking screenshot after translation...');
  await page.screenshot({ path: 'screenshots/03-translated.png', fullPage: true });

  // Check if interlinear text is rendered
  const hasRuby = await page.$('ruby') !== null;
  console.log('Has ruby elements (interlinear text):', hasRuby);

  // Check verse numbers
  const verseNumbers = await page.$$eval('.verse-number', els => els.map(el => el.textContent)).catch(() => []);
  console.log('Verse numbers found:', verseNumbers);

  // Check for word units
  const wordUnits = await page.$$eval('.word-unit', els => els.length).catch(() => 0);
  console.log('Word units found:', wordUnits);

  // Test page size change
  console.log('7. Changing page size to 5.5x8.5...');
  await page.select('select', '5.5x8.5');

  // Find and click Reflow button
  const reflowButton = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(btn => btn.textContent.includes('Reflow'));
  });
  if (reflowButton) {
    await reflowButton.click();
    await new Promise(r => setTimeout(r, 500));
  }
  await page.screenshot({ path: 'screenshots/04-page-size-changed.png', fullPage: true });

  // Test edit mode
  console.log('8. Testing edit mode...');
  const editButton = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(btn => btn.textContent.includes('Edit Mode'));
  });
  if (editButton) {
    await editButton.click();
    await page.screenshot({ path: 'screenshots/05-edit-mode.png', fullPage: true });
  }

  await browser.close();
  console.log('Done! Screenshots saved in screenshots/ folder.');
})();
