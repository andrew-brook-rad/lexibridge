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

  // Clear any existing content first
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle0' });

  console.log('Testing Lego Method with long compound word...');

  // Input text with a long compound word
  const testText = '1 Das ist eine Unabhängigkeitserklärung. 2 Und hier ist ein Unterschied.';

  // Type into textarea
  await page.type('textarea', testText);
  await page.screenshot({ path: 'screenshots/lego-01-text-entered.png', fullPage: true });
  console.log('Text entered');

  // Click Translate
  const translateBtn = await page.$('button.bg-green-600');
  if (translateBtn) {
    console.log('Clicking Translate button... (this takes ~30-60 seconds)');
    await translateBtn.click();

    // Wait for translation to complete (up to 90 seconds)
    await page.waitForSelector('.word-unit', { timeout: 90000 });
    console.log('Translation complete!');

    await page.screenshot({ path: 'screenshots/lego-02-translated.png', fullPage: true });

    // Count compound words
    const compoundCount = await page.$$eval('.word-unit.compound', els => els.length);
    console.log('Compound words found:', compoundCount);

    // Check for soft hyphens in HTML
    const hasSoftHyphens = await page.$$eval('.soft-hyphen', els => els.length > 0);
    console.log('Soft hyphens present:', hasSoftHyphens);

    // Now change to a narrower page size (5.5x8.5)
    console.log('Changing to narrow page size (5.5x8.5)...');
    await page.select('select', '5.5x8.5');
    await new Promise(r => setTimeout(r, 500));

    // Click Reflow button
    const reflowBtn = await page.$('button.bg-blue-600');
    if (reflowBtn) {
      await reflowBtn.click();
      await new Promise(r => setTimeout(r, 500));
    }

    await page.screenshot({ path: 'screenshots/lego-03-narrow.png', fullPage: true });
    console.log('Screenshot saved: lego-03-narrow.png');

    // Check if text can wrap
    const previewWidth = await page.$eval('.print-preview', el => el.offsetWidth);
    console.log('Preview width (narrow):', previewWidth, 'px');

    // Get the text content to verify compound words are split
    const wordUnits = await page.$$('.word-unit');
    console.log('Total word units:', wordUnits.length);

    for (let i = 0; i < Math.min(5, wordUnits.length); i++) {
      const text = await wordUnits[i].evaluate(el => el.textContent);
      const rubyCount = await wordUnits[i].evaluate(el => el.querySelectorAll('ruby').length);
      console.log(`  Word ${i + 1}: "${text.substring(0, 30)}" (${rubyCount} parts)`);
    }

    console.log('\nLego Method test complete!');
    console.log('The soft hyphens (\\u00AD) allow line breaks between morpheme parts.');
    console.log('When a compound word breaks across lines, a hyphen will appear.');
  } else {
    console.log('Translate button not found');
  }

  await browser.close();
})();
