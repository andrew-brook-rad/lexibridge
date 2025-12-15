const puppeteer = require('puppeteer');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('Navigating to http://localhost:3002...');
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });

  // Clear localStorage first
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });

  await page.screenshot({ path: 'screenshots/debug-01-initial.png', fullPage: true });
  console.log('Screenshot: debug-01-initial.png');

  // Check for buttons
  const buttons = await page.$$eval('button', btns => btns.map(b => ({
    text: b.textContent.trim(),
    visible: b.offsetWidth > 0 && b.offsetHeight > 0
  })));
  console.log('All buttons:', buttons);

  // Look for textarea
  const textarea = await page.$('textarea');
  console.log('Textarea found:', !!textarea);

  // Fill text directly
  const sampleText = '1 Am Anfang schuf Gott Himmel und Erde. 2 Und die Erde war wüst und leer.';
  await page.evaluate((text) => {
    const ta = document.querySelector('textarea');
    if (ta) {
      ta.value = text;
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }, sampleText);
  await sleep(500);

  await page.screenshot({ path: 'screenshots/debug-02-text-entered.png', fullPage: true });
  console.log('Screenshot: debug-02-text-entered.png');

  // Try clicking translate button
  const clicked = await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.textContent.includes('Translate')) {
        btn.click();
        return true;
      }
    }
    return false;
  });
  console.log('Clicked translate:', clicked);

  await sleep(5000);  // Wait for translation

  await page.screenshot({ path: 'screenshots/debug-03-after-translate.png', fullPage: true });
  console.log('Screenshot: debug-03-after-translate.png');

  // Check if word units exist
  const wordUnits = await page.$$('.word-unit');
  console.log('Word units found:', wordUnits.length);

  await browser.close();
})();
