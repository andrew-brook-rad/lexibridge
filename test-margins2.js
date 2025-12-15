const puppeteer = require('puppeteer');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('=== Test: Inner margin (gutter) is larger than outer margin ===\n');
  console.log('Navigating to http://localhost:3002...');
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });

  // Clear localStorage first
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });

  // Click KDP Preset button
  console.log('1. Clicking KDP Preset button...');
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.textContent.includes('KDP Preset')) {
        btn.click();
        return true;
      }
    }
    return false;
  });
  await sleep(500);

  // Get all number inputs from the settings panel
  const inputValues = await page.$$eval('.settings-panel input[type="number"]', inputs => {
    return inputs.map(input => ({
      value: parseFloat(input.value),
      min: input.min,
      max: input.max,
      step: input.step
    }));
  });

  console.log('2. All number input values:', inputValues);

  // The margin inputs should be: top, bottom, inner, outer (in order based on layout)
  // Looking at the screenshot: Top=0.75, Bottom=0.75, Inner=0.875, Outer=0.5

  // Get localStorage to verify the values
  const storedData = await page.evaluate(() => {
    const data = localStorage.getItem('lexibridge-project');
    return data ? JSON.parse(data) : null;
  });

  const margins = storedData?.printSettings?.margins;
  console.log('3. Stored margins from localStorage:', margins);

  if (margins) {
    console.log('\n4. Margin values:');
    console.log('   - Top:', margins.top, 'inches');
    console.log('   - Bottom:', margins.bottom, 'inches');
    console.log('   - Inner (Gutter):', margins.inner, 'inches');
    console.log('   - Outer:', margins.outer, 'inches');

    const innerLarger = margins.inner > margins.outer;
    console.log('\n5. Inner > Outer:', innerLarger);
    console.log('   - Inner (', margins.inner, ') > Outer (', margins.outer, ')');

    // KDP recommends inner margin of 0.875" and outer of 0.5"
    const isKDPCorrect = margins.inner === 0.875 && margins.outer === 0.5;
    console.log('6. KDP values correct (inner=0.875, outer=0.5):', isKDPCorrect);

    if (innerLarger) {
      console.log('\n✓ Test PASSED: Inner margin is larger than outer margin');
      console.log('  - Inner (gutter) = 0.875 inches (for binding)');
      console.log('  - Outer = 0.5 inches');
    } else {
      console.log('\n✗ Test FAILED: Inner margin is NOT larger than outer');
    }
  } else {
    console.log('\nERROR: Could not read margins from localStorage');
  }

  // Take screenshot
  await page.screenshot({ path: 'screenshots/margins-test.png', fullPage: true });
  console.log('\nScreenshot saved: screenshots/margins-test.png');

  await browser.close();
})();
