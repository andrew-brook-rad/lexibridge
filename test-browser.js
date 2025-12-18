const puppeteer = require('puppeteer');

async function test() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle0', timeout: 30000 });

  // Take initial screenshot
  await page.screenshot({ path: 'screenshots/test-initial.png', fullPage: true });
  console.log('Saved initial screenshot');

  // Check page title and content
  const title = await page.title();
  console.log('Page title:', title);

  // Check if the main elements exist
  const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
  console.log('Body content preview:', bodyText);

  await browser.close();
  console.log('Test completed successfully');
}

test().catch(err => {
  console.error('Test failed:', err.message);
  process.exit(1);
});
