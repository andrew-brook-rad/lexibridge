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

  // Get the margin values
  const margins = await page.evaluate(() => {
    const inputs = document.querySelectorAll('.settings-panel input[type="number"]');
    const values = {};
    inputs.forEach(input => {
      // Get the label text to identify the input
      const container = input.closest('div');
      const label = container?.previousElementSibling?.textContent || '';
      if (label.includes('Top')) values.top = parseFloat(input.value);
      if (label.includes('Bottom')) values.bottom = parseFloat(input.value);
      if (label.includes('Inner') || label.includes('Gutter')) values.inner = parseFloat(input.value);
      if (label.includes('Outer')) values.outer = parseFloat(input.value);
    });
    return values;
  });

  console.log('2. Current margins after KDP Preset:');
  console.log('   - Top:', margins.top, 'inches');
  console.log('   - Bottom:', margins.bottom, 'inches');
  console.log('   - Inner (Gutter):', margins.inner, 'inches');
  console.log('   - Outer:', margins.outer, 'inches');

  // Verify inner is larger than outer
  const innerLarger = margins.inner > margins.outer;
  console.log('\n3. Inner > Outer:', innerLarger);

  // KDP recommends inner margin of 0.875" and outer of 0.5"
  const isKDPCorrect = margins.inner === 0.875 && margins.outer === 0.5;
  console.log('4. KDP values correct (inner=0.875, outer=0.5):', isKDPCorrect);

  // Take screenshot
  await page.screenshot({ path: 'screenshots/margins-test.png', fullPage: true });
  console.log('\nScreenshot saved: screenshots/margins-test.png');

  if (innerLarger && isKDPCorrect) {
    console.log('\n✓ Test PASSED: Inner margin is larger than outer margin');
    console.log('  - Inner (gutter) = 0.875 inches');
    console.log('  - Outer = 0.5 inches');
  } else {
    console.log('\n✗ Test FAILED');
    if (!innerLarger) console.log('  - Inner margin is not larger than outer');
    if (!isKDPCorrect) console.log('  - KDP values are not correctly set');
  }

  await browser.close();
})();
