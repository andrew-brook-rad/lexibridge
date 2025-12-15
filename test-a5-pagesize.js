const puppeteer = require('puppeteer');

const sampleText = `1 Am Anfang schuf Gott Himmel und Erde. 2 Und die Erde war wüst und leer.`;

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

  console.log('3. Taking screenshot at default 6x9...');
  await page.screenshot({ path: 'screenshots/pagesize-6x9.png', fullPage: true });

  // Get initial dimensions
  const initial6x9 = await page.$eval('.print-preview', el => {
    const style = window.getComputedStyle(el);
    return {
      width: el.offsetWidth,
      height: el.offsetHeight
    };
  });
  console.log(`6x9 dimensions: ${initial6x9.width}x${initial6x9.height}px`);

  console.log('4. Selecting A5 page size...');
  await page.select('select', 'A5');
  await new Promise(r => setTimeout(r, 500));

  // Click Reflow button
  const reflowButton = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(btn => btn.textContent.includes('Reflow'));
  });
  await reflowButton.click();
  await new Promise(r => setTimeout(r, 500));

  console.log('5. Taking screenshot at A5...');
  await page.screenshot({ path: 'screenshots/pagesize-a5.png', fullPage: true });

  // Get A5 dimensions
  const a5Dimensions = await page.$eval('.print-preview', el => {
    const style = window.getComputedStyle(el);
    return {
      width: el.offsetWidth,
      height: el.offsetHeight
    };
  });
  console.log(`A5 dimensions: ${a5Dimensions.width}x${a5Dimensions.height}px`);

  // Check the dropdown value
  const selectedValue = await page.$eval('select', el => el.value);
  console.log('Selected dropdown value:', selectedValue);

  console.log('\n=== VERIFICATION: A5 Page Size ===');

  // A5 is 148mm x 210mm = 5.83in x 8.27in
  // 6x9 is 6in x 9in
  // A5 should be narrower and shorter than 6x9
  const a5IsNarrower = a5Dimensions.width < initial6x9.width;
  console.log(`A5 is narrower than 6x9: ${a5IsNarrower ? '✓ PASS' : '✗ FAIL'}`);

  // A5 aspect ratio is approximately 0.705 (5.83/8.27)
  // 6x9 aspect ratio is 0.667 (6/9)
  const a5AspectRatio = a5Dimensions.width / a5Dimensions.height;
  const expectedA5Ratio = 5.83 / 8.27; // approximately 0.705
  const ratioIsClose = Math.abs(a5AspectRatio - expectedA5Ratio) < 0.1;
  console.log(`A5 aspect ratio (${a5AspectRatio.toFixed(3)}) is close to expected (${expectedA5Ratio.toFixed(3)}): ${ratioIsClose ? '✓ PASS' : '✗ FAIL'}`);

  // Check dropdown shows A5
  const dropdownShowsA5 = selectedValue === 'A5';
  console.log(`Dropdown shows A5: ${dropdownShowsA5 ? '✓ PASS' : '✗ FAIL'}`);

  await browser.close();
  console.log('\nDone!');
})();
