const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('1. Navigating to http://localhost:3001...');
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle0' });

  // Check current page size
  console.log('2. Checking current page size...');
  const currentPageSize = await page.$eval('select', el => el.value);
  console.log('   Current page size:', currentPageSize);

  // Select Custom page size
  console.log('3. Selecting Custom page size...');
  await page.select('select', 'custom');
  await new Promise(r => setTimeout(r, 500));

  await page.screenshot({ path: 'screenshots/custom-pagesize-01.png', fullPage: true });

  // Check if custom dimension inputs appear
  const customInputsVisible = await page.$('input[type="number"][min="4"]') !== null;
  console.log('   Custom dimension inputs visible:', customInputsVisible);

  // Change the width value
  if (customInputsVisible) {
    console.log('4. Entering custom dimensions...');

    // Find width input (first number input with min=4)
    const widthInput = await page.$('input[type="number"][min="4"]');
    if (widthInput) {
      await widthInput.click({ clickCount: 3 });
      await page.keyboard.type('7');
    }

    // Find height input (number input with min=6)
    const heightInput = await page.$('input[type="number"][min="6"]');
    if (heightInput) {
      await heightInput.click({ clickCount: 3 });
      await page.keyboard.type('10');
    }

    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: 'screenshots/custom-pagesize-02.png', fullPage: true });

    // Click Reflow button
    console.log('5. Clicking Reflow...');
    const reflowButton = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(btn => btn.textContent.includes('Reflow'));
    });
    if (reflowButton) {
      await reflowButton.click();
      await new Promise(r => setTimeout(r, 500));
    }

    await page.screenshot({ path: 'screenshots/custom-pagesize-03.png', fullPage: true });
  }

  await browser.close();
  console.log('Done! Custom page size test complete.');
})();
