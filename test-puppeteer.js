const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('Navigating to http://localhost:3001...');
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle0' });

  // Take screenshot
  await page.screenshot({ path: 'screenshot-initial.png', fullPage: true });
  console.log('Screenshot saved: screenshot-initial.png');

  // Check for main elements
  const title = await page.$eval('h1', el => el.textContent).catch(() => 'Not found');
  console.log('Page title:', title);

  // Check for text input
  const hasTextInput = await page.$('textarea') !== null;
  console.log('Has text input:', hasTextInput);

  // Check for settings panel
  const hasSettings = await page.$('.settings-panel') !== null;
  console.log('Has settings panel:', hasSettings);

  await browser.close();
  console.log('Done!');
})();
