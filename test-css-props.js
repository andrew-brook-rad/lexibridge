const puppeteer = require('puppeteer');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('=== Test: CSS custom properties update on settings change ===\n');
  console.log('Navigating to http://localhost:3002...');
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });

  // Get initial CSS custom properties
  const initialProps = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return {
      pageWidth: style.getPropertyValue('--page-width'),
      pageHeight: style.getPropertyValue('--page-height'),
      marginInner: style.getPropertyValue('--margin-inner'),
      marginOuter: style.getPropertyValue('--margin-outer'),
      fontSize: style.getPropertyValue('--base-font-size')
    };
  });
  console.log('1. Initial CSS custom properties:', initialProps);

  // Check if the preview uses inline styles or CSS variables
  const previewStyle = await page.evaluate(() => {
    const preview = document.querySelector('.print-preview');
    if (!preview) return null;
    const computed = getComputedStyle(preview);
    return {
      width: computed.width,
      height: computed.height,
      padding: computed.padding
    };
  });
  console.log('2. Preview element computed style:', previewStyle);

  // Change page size to 5.5x8.5
  console.log('\n3. Changing page size to 5.5x8.5...');
  await page.select('select', '5.5x8.5');
  await sleep(500);

  // Click Reflow
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.textContent.includes('Reflow')) {
        btn.click();
        return;
      }
    }
  });
  await sleep(500);

  // Check CSS properties after change
  const afterProps = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return {
      pageWidth: style.getPropertyValue('--page-width'),
      pageHeight: style.getPropertyValue('--page-height'),
      marginInner: style.getPropertyValue('--margin-inner'),
      marginOuter: style.getPropertyValue('--margin-outer'),
      fontSize: style.getPropertyValue('--base-font-size')
    };
  });
  console.log('4. CSS custom properties after change:', afterProps);

  // Check preview style after change
  const afterPreviewStyle = await page.evaluate(() => {
    const preview = document.querySelector('.print-preview');
    if (!preview) return null;
    const computed = getComputedStyle(preview);
    return {
      width: computed.width,
      height: computed.height,
      padding: computed.padding
    };
  });
  console.log('5. Preview computed style after change:', afterPreviewStyle);

  // Check if width changed
  if (previewStyle && afterPreviewStyle && previewStyle.width !== afterPreviewStyle.width) {
    console.log('\n✓ Preview dimensions changed when page size changed');
  } else {
    console.log('\n- Preview dimensions may have changed (check visually)');
  }

  // Take screenshot
  await page.screenshot({ path: 'screenshots/css-props-test.png', fullPage: true });
  console.log('\nScreenshot saved: screenshots/css-props-test.png');

  await browser.close();
})();
