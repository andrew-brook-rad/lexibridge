const puppeteer = require('puppeteer');

const sampleText = `1 Am Anfang schuf Gott Himmel und Erde.`;

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

  console.log('3. Testing font size 10pt...');
  // Find the font size slider
  const slider = await page.$('input[type="range"]');

  // Get slider bounds
  const sliderBoundingBox = await slider.boundingBox();

  // Calculate position for 10pt (min value)
  // Slider range is 10-14, so 10pt is at the left edge
  const min10ptX = sliderBoundingBox.x + 5;
  const sliderY = sliderBoundingBox.y + sliderBoundingBox.height / 2;

  await page.mouse.click(min10ptX, sliderY);
  await new Promise(r => setTimeout(r, 500));

  // Check font size label
  const fontSizeLabel10 = await page.$eval('.settings-panel', el => {
    const label = el.querySelector('[class*="font"]');
    return el.textContent;
  });
  console.log('Font size after moving to 10pt area:', fontSizeLabel10.includes('10pt') ? '10pt found' : 'checking...');

  await page.screenshot({ path: 'screenshots/font-size-10pt.png', fullPage: true });

  // Get actual font size applied to source text
  const sourceFontSize10 = await page.$eval('rb, .source-text', el => {
    return window.getComputedStyle(el).fontSize;
  });
  console.log('Source text font size at 10pt setting:', sourceFontSize10);

  console.log('4. Testing font size 14pt...');
  // Calculate position for 14pt (max value)
  const max14ptX = sliderBoundingBox.x + sliderBoundingBox.width - 5;

  await page.mouse.click(max14ptX, sliderY);
  await new Promise(r => setTimeout(r, 500));

  await page.screenshot({ path: 'screenshots/font-size-14pt.png', fullPage: true });

  // Get actual font size applied to source text
  const sourceFontSize14 = await page.$eval('rb, .source-text', el => {
    return window.getComputedStyle(el).fontSize;
  });
  console.log('Source text font size at 14pt setting:', sourceFontSize14);

  console.log('\n=== VERIFICATION: Font Sizes ===');

  // Parse font sizes to compare
  const size10 = parseFloat(sourceFontSize10);
  const size14 = parseFloat(sourceFontSize14);

  console.log(`10pt computed: ${size10}px, 14pt computed: ${size14}px`);

  // Check that 14pt is larger than 10pt
  const fontScalingWorks = size14 > size10;
  console.log(`Font scaling works (14pt > 10pt): ${fontScalingWorks ? '✓ PASS' : '✗ FAIL'}`);

  // Check reasonable values - 10pt ~ 13.3px, 14pt ~ 18.6px at standard DPI
  const size10Reasonable = size10 >= 10 && size10 <= 20;
  const size14Reasonable = size14 >= 14 && size14 <= 25;
  console.log(`10pt in reasonable range: ${size10Reasonable ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`14pt in reasonable range: ${size14Reasonable ? '✓ PASS' : '✗ FAIL'}`);

  await browser.close();
  console.log('\nDone!');
})();
