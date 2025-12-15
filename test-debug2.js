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

  // Click the "Load Genesis 1:1-8 Sample" button instead
  console.log('Clicking Load Sample button...');
  const loadSampleClicked = await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.textContent.includes('Load Genesis')) {
        btn.click();
        return true;
      }
    }
    return false;
  });
  console.log('Load sample clicked:', loadSampleClicked);
  await sleep(500);

  await page.screenshot({ path: 'screenshots/debug2-01-sample-loaded.png', fullPage: true });

  // Now click Translate
  console.log('Clicking Translate button...');
  const translateClicked = await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.textContent.trim() === 'Translate') {
        btn.click();
        return true;
      }
    }
    return false;
  });
  console.log('Translate clicked:', translateClicked);

  // Wait longer for API response
  console.log('Waiting for translation (15 seconds)...');
  await sleep(15000);

  await page.screenshot({ path: 'screenshots/debug2-02-after-translate.png', fullPage: true });
  console.log('Screenshot saved');

  // Check if word units exist
  const wordUnits = await page.$$('.word-unit');
  console.log('Word units found:', wordUnits.length);

  // Check for any error messages
  const errorText = await page.evaluate(() => {
    const error = document.querySelector('.text-red-500, .error');
    return error ? error.textContent : null;
  });
  console.log('Error message:', errorText);

  // Check the preview content
  const previewText = await page.evaluate(() => {
    const preview = document.querySelector('.print-preview');
    return preview ? preview.textContent.substring(0, 200) : 'No preview found';
  });
  console.log('Preview content:', previewText);

  await browser.close();
})();
