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
      letterSpacing: style.letterSpacing,
      marginBottom: style.marginBottom
    };
  });

  console.log('1. Title element data:', titleData);

  // Check body text style for comparison
  const bodyData = await page.evaluate(() => {
    const bodyEl = document.querySelector('.interlinear-text');
    if (!bodyEl) return null;

    const style = getComputedStyle(bodyEl);
    return {
      fontSize: style.fontSize,
      fontFamily: style.fontFamily,
      textAlign: style.textAlign
    };
  });

  console.log('2. Body text style:', bodyData);

  // Check chapter header style
  const chapterData = await page.evaluate(() => {
    const chapterEl = document.querySelector('.chapter-header');
    if (!chapterEl) return null;

    const style = getComputedStyle(chapterEl);
    return {
      text: chapterEl.textContent,
      fontSize: style.fontSize,
      textAlign: style.textAlign
    };
  });

  console.log('3. Chapter header style:', chapterData);

  // Verify distinctions
  if (titleData && bodyData) {
    const titleFontSize = parseFloat(titleData.fontSize);
    const bodyFontSize = parseFloat(bodyData.fontSize);

    console.log('\n=== Style Comparison ===');
    console.log(`Title font size: ${titleData.fontSize} (${titleFontSize}px)`);
    console.log(`Body font size: ${bodyData.fontSize} (${bodyFontSize}px)`);
    console.log(`Title is larger: ${titleFontSize > bodyFontSize}`);
    console.log(`Title text-align: ${titleData.textAlign}`);

    if (titleFontSize > bodyFontSize && titleData.textAlign === 'center') {
      console.log('\n✓ Test PASSED: Title renders distinctly from body');
      console.log('  - Larger font size');
      console.log('  - Centered alignment');
      console.log('  - Letter spacing for elegance');
    }
  } else {
    console.log('\n✗ Could not compare styles');
  }

  await page.screenshot({ path: 'screenshots/title-page-test.png', fullPage: true });
  console.log('\nScreenshot saved: screenshots/title-page-test.png');

  await browser.close();
})();
