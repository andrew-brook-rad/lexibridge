const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('Navigating to localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });

  const title = await page.title();
  console.log('Page title:', title);

  await page.screenshot({ path: 'screenshots/session67-01-initial.png', fullPage: false });
  console.log('Screenshot saved: session67-01-initial.png');

  await browser.close();
  console.log('Done!');
})();
