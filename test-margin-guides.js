const puppeteer = require('puppeteer');

async function testMarginGuides() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  console.log('Navigating to app...');
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });

  // Take screenshot to see margin guides
  await page.screenshot({ path: 'screenshots/margin-guides-01.png' });
  console.log('Screenshot 1: Initial view with margin guides');

  // Check if margin guides elements exist
  const marginGuides = await page.$('.margin-guides');
  const hasMarginGuides = marginGuides !== null;
  console.log(`Margin guides container exists: ${hasMarginGuides}`);

  // Check individual guide elements
  const topGuide = await page.$('.margin-guide-top');
  const bottomGuide = await page.$('.margin-guide-bottom');
  const innerGuide = await page.$('.margin-guide-inner');
  const outerGuide = await page.$('.margin-guide-outer');

  console.log(`Top guide exists: ${topGuide !== null}`);
  console.log(`Bottom guide exists: ${bottomGuide !== null}`);
  console.log(`Inner guide exists: ${innerGuide !== null}`);
  console.log(`Outer guide exists: ${outerGuide !== null}`);

  // Check styles
  const guideStyles = await page.evaluate(() => {
    const inner = document.querySelector('.margin-guide-inner');
    if (!inner) return null;
    const style = window.getComputedStyle(inner);
    return {
      width: style.width,
      background: style.backgroundColor,
      border: style.border
    };
  });
  console.log('Inner guide styles:', guideStyles);

  await browser.close();

  console.log('\n=== TEST RESULTS ===');
  const allGuidesExist = topGuide && bottomGuide && innerGuide && outerGuide;
  if (allGuidesExist) {
    console.log('SUCCESS: All margin guide elements exist!');
    return true;
  } else {
    console.log('FAIL: Some margin guide elements are missing');
    return false;
  }
}

testMarginGuides().then(success => {
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
