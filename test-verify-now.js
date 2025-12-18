const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });

    console.log('Navigating to app...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle0', timeout: 30000 });

    // Take screenshot of initial page
    await page.screenshot({ path: 'screenshots/verify-1-initial.png', fullPage: false });
    console.log('Screenshot 1: Initial page');

    // Check if the page loaded correctly
    const title = await page.title();
    console.log('Page title:', title);

    // Look for key UI elements
    const pageContent = await page.content();
    console.log('Page has content:', pageContent.length, 'characters');

    // Look for any buttons
    const buttons = await page.$$eval('button', btns => btns.map(b => b.textContent.trim()).filter(t => t));
    console.log('Buttons found:', buttons.slice(0, 15));

    // Take another screenshot
    await page.screenshot({ path: 'screenshots/verify-2-loaded.png', fullPage: false });
    console.log('Screenshot 2: Full page');

    console.log('Verification complete!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
