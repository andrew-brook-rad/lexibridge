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

  // Get initial CSS custom properties from the preview element
  const getPreviewProps = async () => {
    return await page.evaluate(() => {
      const preview = document.querySelector('.print-preview');
      if (!preview) return null;

      // Get inline style values
      const style = preview.style;
      const computed = getComputedStyle(preview);

      return {
        // From inline style
        pageWidth: style.getPropertyValue('--page-width'),
        pageHeight: style.getPropertyValue('--page-height'),
        marginInner: style.getPropertyValue('--margin-inner'),
        fontSizeBase: style.getPropertyValue('--font-size-base'),
        // Computed dimensions
        width: computed.width,
        height: computed.height
      };
    });
  };

  console.log('1. Initial CSS custom properties on .print-preview:');
  const initialProps = await getPreviewProps();
  console.log(initialProps);

  // Change page size to 5.5x8.5
  console.log('\n2. Changing page size to 5.5x8.5...');
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

  console.log('3. CSS custom properties after changing to 5.5x8.5:');
  const after55 = await getPreviewProps();
  console.log(after55);

  // Change page size to A5
  console.log('\n4. Changing page size to A5...');
  await page.select('select', 'A5');
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
  await sleep(500);

  console.log('5. CSS custom properties after changing to A5:');
  const afterA5 = await getPreviewProps();
  console.log(afterA5);

  // Verify changes
  console.log('\n=== Verification ===');

  if (initialProps && after55 && afterA5) {
    const widthChanged = initialProps.pageWidth !== after55.pageWidth && after55.pageWidth !== afterA5.pageWidth;
    const heightChanged = initialProps.pageHeight !== after55.pageHeight && after55.pageHeight !== afterA5.pageHeight;

    console.log('Page width changed across settings:', initialProps.pageWidth, '->', after55.pageWidth, '->', afterA5.pageWidth);
    console.log('Page height changed across settings:', initialProps.pageHeight, '->', after55.pageHeight, '->', afterA5.pageHeight);

    if (widthChanged && heightChanged) {
      console.log('\n✓ Test PASSED: CSS custom properties update correctly when settings change');
    } else {
      console.log('\n✗ Test needs review');
    }
  }

  await browser.close();
})();
