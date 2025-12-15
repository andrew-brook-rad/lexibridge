const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('Navigating to http://localhost:3003...');
  await page.goto('http://localhost:3003', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'screenshots/verify-session7-initial.png', fullPage: true });
  console.log('Screenshot saved: verify-session7-initial.png');

  // Check main elements
  const title = await page.$eval('h1', el => el.textContent).catch(() => 'Not found');
  console.log('Page title:', title);

  // Check if there's already translated content (from localStorage)
  const wordUnits = await page.$$('.word-unit');
  console.log('Word units found:', wordUnits.length);

  // Check for settings panel
  const hasSettings = await page.$('.settings-panel') !== null;
  console.log('Has settings panel:', hasSettings);

  // Check for text input
  const hasTextInput = await page.$('textarea') !== null;
  console.log('Has text input:', hasTextInput);

  // If there's content already, verify its structure
  if (wordUnits.length > 0) {
    console.log('Existing translated content found!');

    // Check verse numbers
    const verseNums = await page.$$('.verse-number');
    console.log('Verse numbers found:', verseNums.length);

    // Check compound words
    const compoundWords = await page.$$eval('.word-unit', units => {
      return units.filter(u => u.querySelectorAll('ruby').length > 1).length;
    });
    console.log('Compound words (multi-part):', compoundWords);

    await page.screenshot({ path: 'screenshots/verify-session7-content.png', fullPage: true });
  } else {
    console.log('No existing content, loading sample...');

    // Click "Load Genesis 1:1-8 Sample" link
    await page.click('text/Load Genesis');
    await new Promise(r => setTimeout(r, 500));

    // Check if textarea has content
    const textareaContent = await page.$eval('textarea', el => el.value);
    console.log('Sample loaded, text length:', textareaContent.length);

    await page.screenshot({ path: 'screenshots/verify-session7-sample-loaded.png', fullPage: true });

    // Note: Translation takes ~70 seconds, so we won't do it in this quick test
    console.log('Sample text loaded successfully. Translation would take ~70 seconds.');
  }

  await browser.close();
  console.log('Verification complete!');
})();
