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

  // Clear localStorage and reload
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });

  console.log('Loading Genesis 1:1-8 sample...');

  // Click "Load Genesis 1:1-8 Sample" link
  await page.click('text/Load Genesis');
  await new Promise(r => setTimeout(r, 500));

  // Check textarea content
  const textContent = await page.$eval('textarea', el => el.value);
  console.log('Sample text length:', textContent.length);
  console.log('First 200 chars:', textContent.substring(0, 200));

  await page.screenshot({ path: 'screenshots/lego-full-01-sample.png', fullPage: true });

  // Click Translate
  console.log('\nTranslating... (this takes ~60-90 seconds)');
  const translateBtn = await page.$('button.bg-green-600');
  await translateBtn.click();

  // Wait for translation with longer timeout
  try {
    await page.waitForSelector('.word-unit', { timeout: 120000 });
    console.log('Translation complete!');
  } catch (e) {
    console.log('Translation timed out or error:', e.message);
    await page.screenshot({ path: 'screenshots/lego-full-error.png', fullPage: true });
    await browser.close();
    return;
  }

  await page.screenshot({ path: 'screenshots/lego-full-02-translated.png', fullPage: true });

  // Count elements
  const wordUnits = await page.$$('.word-unit');
  const compounds = await page.$$('.word-unit.compound');
  const verseNums = await page.$$('.verse-number');
  const softHyphens = await page.$$('.soft-hyphen');

  console.log('\n=== Translation Results ===');
  console.log('Total word units:', wordUnits.length);
  console.log('Compound words:', compounds.length);
  console.log('Verse numbers:', verseNums.length);
  console.log('Soft hyphens:', softHyphens.length);

  // List compound words
  console.log('\n=== Compound Words ===');
  for (let i = 0; i < compounds.length; i++) {
    const text = await compounds[i].evaluate(el => {
      const parts = el.querySelectorAll('.source-text');
      return Array.from(parts).map(p => p.textContent).join(' + ');
    });
    const glosses = await compounds[i].evaluate(el => {
      const parts = el.querySelectorAll('.gloss-text');
      return Array.from(parts).map(p => p.textContent).join(' + ');
    });
    console.log(`  ${i + 1}. ${text} => ${glosses}`);
  }

  // Now test with narrow width
  console.log('\n=== Testing narrow width ===');
  await page.select('select', '5.5x8.5');
  await new Promise(r => setTimeout(r, 300));

  // Click Reflow
  const reflowBtn = await page.$('button.bg-blue-600');
  await reflowBtn.click();
  await new Promise(r => setTimeout(r, 500));

  await page.screenshot({ path: 'screenshots/lego-full-03-narrow.png', fullPage: true });

  const previewWidth = await page.$eval('.print-preview', el => el.offsetWidth);
  console.log('Preview width (5.5x8.5):', previewWidth, 'px');

  console.log('\n=== Lego Method Test Complete ===');
  console.log('Screenshots saved to screenshots/lego-full-*.png');
  console.log('Soft hyphens (\\u00AD) are embedded in compound words.');
  console.log('These allow the browser to break lines with a hyphen when needed.');

  await browser.close();
})();
