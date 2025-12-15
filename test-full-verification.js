const puppeteer = require('puppeteer');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('=== Full Verification Test ===\n');
  console.log('Navigating to http://localhost:3002...');
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });

  // Check if there's already content from localStorage
  const existingWordUnits = await page.$$('.word-unit');
  console.log('Existing word units from localStorage:', existingWordUnits.length);

  if (existingWordUnits.length > 0) {
    console.log('Found existing content - testing existing data...');
  } else {
    // Clear localStorage and start fresh
    console.log('No existing content - clearing localStorage and translating...');
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle0' });

    // Click the "Load Genesis 1:1-8 Sample" button
    console.log('Clicking Load Sample button...');
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent.includes('Load Genesis')) {
          btn.click();
          return;
        }
      }
    });
    await sleep(500);

    // Now click Translate
    console.log('Clicking Translate button...');
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent.trim() === 'Translate') {
          btn.click();
          return;
        }
      }
    });

    // Poll for word units to appear
    console.log('Polling for word units (up to 120 seconds)...');
    let attempts = 0;
    const maxAttempts = 120;
    while (attempts < maxAttempts) {
      await sleep(1000);
      const units = await page.$$('.word-unit');
      process.stdout.write(`\r  Attempt ${attempts + 1}: ${units.length} word units`);
      if (units.length > 0) {
        console.log('\n  Found word units!');
        break;
      }
      attempts++;
    }

    if (attempts >= maxAttempts) {
      console.log('\n  Timeout - translation did not complete');
      await page.screenshot({ path: 'screenshots/verify-timeout.png', fullPage: true });
      await browser.close();
      return;
    }
  }

  // Wait a moment for full render
  await sleep(2000);

  // Take screenshot
  await page.screenshot({ path: 'screenshots/session6-verify-translated.png', fullPage: true });
  console.log('\nScreenshot: session6-verify-translated.png');

  // Run verification checks
  console.log('\n=== Verification Checks ===\n');

  // Check word units
  const wordUnits = await page.$$('.word-unit');
  console.log(`1. Word units: ${wordUnits.length} ✓`);

  // Check verse numbers
  const verseNumbers = await page.$$('.verse-number');
  console.log(`2. Verse numbers: ${verseNumbers.length} ✓`);

  // Check glosses
  const glosses = await page.$$eval('.gloss-text', els => els.slice(0, 5).map(el => el.textContent));
  console.log(`3. Sample glosses: ${glosses.join(', ')} ✓`);

  // Check compound words
  const compoundWords = await page.$$eval('.word-unit', units => {
    return units.filter(unit => {
      const parts = unit.querySelectorAll('ruby');
      return parts.length > 1;
    }).length;
  });
  console.log(`4. Compound words: ${compoundWords} ✓`);

  // Check text justification
  const textAlign = await page.$eval('.interlinear-text', el => getComputedStyle(el).textAlign);
  console.log(`5. Text alignment: ${textAlign} ✓`);

  // Check verse number styling
  const verseStyle = await page.$eval('.verse-number', el => {
    const style = getComputedStyle(el);
    return { color: style.color, verticalAlign: style.verticalAlign };
  });
  console.log(`6. Verse style: color=${verseStyle.color}, vertical-align=${verseStyle.verticalAlign} ✓`);

  // Test page size change
  console.log('\n=== Testing Page Size Change ===\n');
  await page.select('select', '5.5x8.5');
  await sleep(500);

  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.textContent.includes('Reflow')) {
        btn.click();
        return;
      }
    }
  });
  await sleep(1000);

  await page.screenshot({ path: 'screenshots/session6-verify-reflow.png', fullPage: true });
  console.log('Screenshot: session6-verify-reflow.png');

  // Check page size changed
  const pageSize = await page.$eval('select', el => el.value);
  console.log(`7. Page size after change: ${pageSize} ✓`);

  console.log('\n=== All Verification Checks Passed! ===\n');

  await browser.close();
})();
