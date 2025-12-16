const puppeteer = require('puppeteer');

async function test() {
  console.log('Starting browser test...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('Navigating to localhost:3001...');

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 60000 });
    console.log('Page loaded (domcontentloaded)');

    // Wait a bit for React to render
    await new Promise(r => setTimeout(r, 3000));

    // Take initial screenshot
    await page.screenshot({ path: 'screenshots/verify-initial.png', fullPage: true });
    console.log('Saved initial screenshot');

    // Check page title and content
    const title = await page.title();
    console.log('Page title:', title);

    // Get page content
    const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 1000));
    console.log('Body content preview:');
    console.log(bodyText);

    // Check for key elements
    const hasTitle = await page.evaluate(() => {
      return document.body.innerText.includes('LexiBridge') || document.body.innerText.includes('Interlinear');
    });
    console.log('Has app title:', hasTitle);

    await browser.close();
    console.log('Test completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Navigation error:', err.message);
    await page.screenshot({ path: 'screenshots/verify-error.png' }).catch(() => {});
    await browser.close();
    process.exit(1);
  }
}

test();
