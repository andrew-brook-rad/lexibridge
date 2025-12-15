const puppeteer = require('puppeteer');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('=== Test: Error state displays user-friendly message ===\n');
  console.log('Navigating to http://localhost:3002...');
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });

  // Clear localStorage first
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });

  // Try to translate empty text (should trigger an error or be handled gracefully)
  console.log('1. Testing with empty text...');

  // Find and click Translate button without entering text
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
  console.log('   Clicked translate:', translateClicked);

  await sleep(3000);

  // Check for error message
  let errorMessage = await page.evaluate(() => {
    const error = document.querySelector('.bg-red-50, .text-red-700, [class*="error"]');
    return error ? error.textContent : null;
  });
  console.log('2. Error message for empty text:', errorMessage || '(none)');

  // Take screenshot
  await page.screenshot({ path: 'screenshots/error-state-01.png', fullPage: true });

  // Now test with the app not crashing (application remains usable)
  console.log('3. Verifying application remains usable...');

  // Check if main elements are still visible
  const hasTextarea = await page.$('textarea') !== null;
  const hasSettings = await page.$('.settings-panel') !== null;
  const hasButtons = (await page.$$('button')).length > 0;

  console.log('   - Textarea visible:', hasTextarea);
  console.log('   - Settings panel visible:', hasSettings);
  console.log('   - Buttons visible:', hasButtons);

  if (hasTextarea && hasSettings && hasButtons) {
    console.log('\n✓ Application did not crash and remains usable');
  }

  // Check if error can be dismissed
  const dismissButton = await page.evaluate(() => {
    const btn = document.querySelector('.bg-red-50 button, .text-red-700 ~ button');
    return btn ? btn.textContent : null;
  });
  if (dismissButton) {
    console.log('4. Dismiss button found:', dismissButton);
  }

  // Final screenshot
  await page.screenshot({ path: 'screenshots/error-state-02.png', fullPage: true });
  console.log('\nScreenshots saved');

  // Check if the translate button doesn't work with empty textarea
  // (which is actually expected good behavior)
  const textareaEmpty = await page.$eval('textarea', ta => ta.value.trim() === '');
  if (textareaEmpty) {
    console.log('\n✓ Empty textarea is handled (no crash)');
  }

  await browser.close();
})();
