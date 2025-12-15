const puppeteer = require('puppeteer');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('Navigating to http://localhost:3002...');
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });

  // Clear localStorage first
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

  // Wait for word-unit to appear with a long timeout
  console.log('Waiting for word units to appear (up to 60 seconds)...');
  try {
    await page.waitForSelector('.word-unit', { timeout: 60000 });
    console.log('Word units appeared!');
  } catch (e) {
    console.log('Timeout waiting for word units');
    await page.screenshot({ path: 'screenshots/debug3-timeout.png', fullPage: true });
    await browser.close();
    return;
  }

  // Give it a moment to fully render
  await sleep(2000);

  await page.screenshot({ path: 'screenshots/debug3-success.png', fullPage: true });
  console.log('Screenshot saved: debug3-success.png');

  // Check if word units exist
  const wordUnits = await page.$$('.word-unit');
  console.log('Word units found:', wordUnits.length);

  // Check for verse numbers
  const verseNumbers = await page.$$('.verse-number');
  console.log('Verse numbers found:', verseNumbers.length);

  // Get some glosses
  const glosses = await page.$$eval('.gloss-text', els => els.slice(0, 10).map(el => el.textContent));
  console.log('Sample glosses:', glosses);

  console.log('\n=== Translation successful! ===');

  await browser.close();
})();
