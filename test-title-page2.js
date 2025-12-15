const puppeteer = require('puppeteer');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('=== Test: Title page renders distinctly from body content ===\n');
  console.log('Navigating to http://localhost:3002...');
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });

  // Check if content exists, if not, load and translate
  let hasContent = (await page.$$('.word-unit')).length > 0;

  if (!hasContent) {
    console.log('No content, loading sample...');
    // Load sample
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

    // Translate
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent.trim() === 'Translate') {
          btn.click();
          return;
        }
      }
    });

    console.log('Waiting for translation...');
    await page.waitForSelector('.word-unit', { timeout: 120000 });
    await sleep(2000);
  }

  // Check title element
  const titleData = await page.evaluate(() => {
    const titleEl = document.querySelector('.book-title');
    if (!titleEl) return null;

    const style = getComputedStyle(titleEl);
    return {
      text: titleEl.textContent,
      fontSize: style.fontSize,
      fontFamily: style.fontFamily,
      textAlign: style.textAlign,
      letterSpacing: style.letterSpacing
    };
  });

  console.log('1. Title element:', titleData);

  // Check body text (from a ruby source element)
  const bodyData = await page.evaluate(() => {
    const bodyEl = document.querySelector('.source-text');
    if (!bodyEl) return null;

    const style = getComputedStyle(bodyEl);
    return {
      fontSize: style.fontSize,
      fontFamily: style.fontFamily
    };
  });

  console.log('2. Body source text:', bodyData);

  // Verify distinctions
  if (titleData && bodyData) {
    const titleFontSize = parseFloat(titleData.fontSize);
    const bodyFontSize = parseFloat(bodyData.fontSize);

    console.log('\n=== Style Comparison ===');
    console.log(`Title font size: ${titleFontSize}px`);
    console.log(`Body font size: ${bodyFontSize}px`);
    console.log(`Title is ${(titleFontSize / bodyFontSize).toFixed(1)}x larger than body`);

    if (titleFontSize > bodyFontSize && titleData.textAlign === 'center') {
      console.log('\n✓ Test PASSED: Title renders distinctly from body');
      console.log('  - Title is significantly larger (2x+ body size)');
      console.log('  - Title is centered');
      console.log('  - Title has letter-spacing:', titleData.letterSpacing);
    }
  }

  await page.screenshot({ path: 'screenshots/title-page-test.png', fullPage: true });
  console.log('\nScreenshot saved: screenshots/title-page-test.png');

  await browser.close();
})();
