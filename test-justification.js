const puppeteer = require('puppeteer');

const sampleText = `1 Am Anfang schuf Gott Himmel und Erde. 2 Und die Erde war wüst und leer, und es war finster auf der Tiefe; und der Geist Gottes schwebte auf dem Wasser. 3 Und Gott sprach: Es werde Licht! und es ward Licht.`;

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('1. Navigating to http://localhost:3002...');
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });

  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });

  console.log('2. Creating translation...');
  await page.type('textarea', sampleText);

  const translateButton = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(btn => btn.textContent.includes('Translate'));
  });
  await translateButton.click();

  await page.waitForSelector('ruby, .word-unit', { timeout: 60000 });
  await new Promise(r => setTimeout(r, 2000));

  console.log('3. Checking text justification...');

  // Check CSS for justification
  const textAlign = await page.$eval('.interlinear-text, .preview-content', el => {
    return window.getComputedStyle(el).textAlign;
  }).catch(() => 'not found');

  console.log('Text-align on content:', textAlign);

  // Check verse number styling
  const verseNumberStyles = await page.$eval('.verse-number', el => {
    const style = window.getComputedStyle(el);
    return {
      verticalAlign: style.verticalAlign,
      color: style.color,
      display: style.display
    };
  }).catch(() => ({ error: 'verse-number not found' }));

  console.log('Verse number styles:', verseNumberStyles);

  // Check if verse numbers are inline (not block level)
  const verseNumberDisplay = verseNumberStyles.display || 'not found';

  console.log('\n=== VERIFICATION: Text Justification ===');
  console.log(`Text is justified: ${textAlign === 'justify' ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`Verse numbers are inline: ${!verseNumberDisplay.includes('block') ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`Verse numbers have vertical-align super: ${verseNumberStyles.verticalAlign === 'super' ? '✓ PASS' : '✗ FAIL'}`);

  await page.screenshot({ path: 'screenshots/justification-test.png', fullPage: true });

  await browser.close();
  console.log('\nDone!');
})();
