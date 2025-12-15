const puppeteer = require('puppeteer');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('=== Test: Project metadata stores title and language ===\n');
  console.log('Navigating to http://localhost:3002...');
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });

  // Clear localStorage first
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });

  // Check default title
  const defaultTitle = await page.$eval('input[type="text"]', el => el.value);
  console.log('1. Default title:', defaultTitle);

  // Change the title
  console.log('2. Changing title to "Test Book"...');
  await page.evaluate(() => {
    const input = document.querySelector('input[type="text"]');
    input.value = 'Test Book';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await sleep(500);

  // Verify the title changed
  const newTitle = await page.$eval('input[type="text"]', el => el.value);
  console.log('3. New title after change:', newTitle);

  // Check localStorage
  const storedData = await page.evaluate(() => {
    const data = localStorage.getItem('lexibridge-project');
    return data ? JSON.parse(data) : null;
  });
  console.log('4. Stored meta data:', storedData?.meta);

  // Refresh the page
  console.log('5. Refreshing page...');
  await page.reload({ waitUntil: 'networkidle0' });
  await sleep(500);

  // Check if title persisted
  const persistedTitle = await page.$eval('input[type="text"]', el => el.value);
  console.log('6. Title after refresh:', persistedTitle);

  // Verify
  if (persistedTitle === 'Test Book') {
    console.log('\n✓ Test PASSED: Title persists across sessions');
  } else {
    console.log('\n✗ Test FAILED: Title did not persist');
  }

  // Check the meta object has the expected structure
  const finalData = await page.evaluate(() => {
    const data = localStorage.getItem('lexibridge-project');
    return data ? JSON.parse(data) : null;
  });

  console.log('\n7. Final meta object:', finalData?.meta);

  if (finalData?.meta?.title && finalData?.meta?.language) {
    console.log('✓ Meta object has title and language fields');
  } else {
    console.log('✗ Meta object is missing title or language fields');
  }

  await page.screenshot({ path: 'screenshots/metadata-test.png', fullPage: true });
  console.log('\nScreenshot saved: screenshots/metadata-test.png');

  await browser.close();
})();
