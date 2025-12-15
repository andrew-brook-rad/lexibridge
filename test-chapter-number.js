const puppeteer = require('puppeteer');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('=== Test: Chapter number is stored and rendered for each chapter ===\n');
  console.log('Navigating to http://localhost:3002...');
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });

  // Check if there's already translated content
  const hasWordUnits = (await page.$$('.word-unit')).length > 0;

  if (!hasWordUnits) {
    console.log('No existing content, loading sample and translating...');
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle0' });

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

    // Wait for word units
    console.log('Waiting for translation...');
    await page.waitForSelector('.word-unit', { timeout: 120000 });
    await sleep(2000);
  }

  // Check chapter header
  const chapterHeader = await page.$eval('.chapter-header', el => el.textContent);
  console.log('1. Chapter header text:', chapterHeader);

  // Check data structure
  const chapterData = await page.evaluate(() => {
    const data = localStorage.getItem('lexibridge-project');
    if (!data) return null;
    const project = JSON.parse(data);
    return project.chapters.map(ch => ({
      number: ch.number,
      paragraphCount: ch.paragraphs?.length
    }));
  });
  console.log('2. Chapter data from localStorage:', chapterData);

  // Verify
  if (chapterHeader && chapterHeader.includes('Chapter') && chapterData && chapterData[0]?.number === 1) {
    console.log('\n✓ Test PASSED:');
    console.log('  - Chapter number stored in data structure:', chapterData[0].number);
    console.log('  - Chapter header rendered:', chapterHeader);
  } else {
    console.log('\n✗ Test FAILED');
  }

  await page.screenshot({ path: 'screenshots/chapter-number-test.png', fullPage: true });
  console.log('\nScreenshot saved: screenshots/chapter-number-test.png');

  await browser.close();
})();
