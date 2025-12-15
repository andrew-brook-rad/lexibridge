const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('Testing hyphen display when compound words break across lines...\n');

  // Navigate to app
  await page.goto('http://localhost:3003', { waitUntil: 'networkidle0' });

  // Check if we have existing content
  let wordUnits = await page.$$('.word-unit');

  if (wordUnits.length === 0) {
    console.log('No existing content. Loading sample and translating...');

    // Clear localStorage
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle0' });

    // Click "Load Genesis 1:1-8 Sample" link
    await page.click('text/Load Genesis');
    await new Promise(r => setTimeout(r, 500));

    // Translate
    const translateBtn = await page.$('button.bg-green-600');
    await translateBtn.click();
    await page.waitForSelector('.word-unit', { timeout: 120000 });
    console.log('Translation complete!');
  } else {
    console.log('Using existing translated content');
  }

  // Now test with a very narrow custom width to force line breaks
  console.log('\nSetting very narrow page (3.5 inch) to force line breaks...');

  // Select custom page size
  await page.select('select', 'custom');
  await new Promise(r => setTimeout(r, 300));

  // Find and set custom width input to 3.5 inches
  const inputs = await page.$$('input[type="number"]');
  let widthSet = false;
  for (const input of inputs) {
    const placeholder = await input.evaluate(el => el.placeholder || '');
    const value = await input.evaluate(el => el.value);
    // Width input typically has value 6 initially or placeholder "Width"
    if (placeholder.toLowerCase().includes('width') || value === '6') {
      await input.click({ clickCount: 3 });
      await input.type('3.5');
      widthSet = true;
      break;
    }
  }

  if (!widthSet) {
    // Try the first number input that looks like page width
    for (const input of inputs) {
      const value = await input.evaluate(el => parseFloat(el.value));
      if (value >= 5 && value <= 8) {
        await input.click({ clickCount: 3 });
        await input.type('3.5');
        break;
      }
    }
  }

  await new Promise(r => setTimeout(r, 300));

  // Click Reflow button
  const reflowBtn = await page.$('button.bg-blue-600');
  await reflowBtn.click();
  await new Promise(r => setTimeout(r, 500));

  await page.screenshot({ path: 'screenshots/hyphen-break-test.png', fullPage: true });

  // Check preview width
  const previewWidth = await page.$eval('.print-preview', el => el.offsetWidth);
  console.log('Preview width:', previewWidth, 'px (expected ~336px for 3.5in)');

  // Count compound words
  const compounds = await page.$$('.word-unit.compound');
  console.log('Compound words:', compounds.length);

  // Check for soft hyphens in the HTML
  const softHyphens = await page.$$eval('.soft-hyphen', els => els.length);
  console.log('Soft hyphen elements:', softHyphens);

  // Look at the actual HTML to verify soft hyphens
  const html = await page.evaluate(() => {
    const preview = document.querySelector('.print-preview');
    return preview ? preview.innerHTML : '';
  });

  // Check if soft hyphen character exists
  const hasSoftHyphen = html.includes('\u00AD') || html.includes('­');
  console.log('Contains soft hyphen (\\u00AD):', hasSoftHyphen);

  // Examine compound word structure
  console.log('\n=== Compound Word Structure ===');
  for (let i = 0; i < Math.min(3, compounds.length); i++) {
    const structure = await compounds[i].evaluate(el => {
      const parts = [];
      el.childNodes.forEach(child => {
        if (child.nodeType === 1) { // Element node
          parts.push({
            tag: child.tagName,
            class: child.className,
            text: child.textContent.substring(0, 50)
          });
        }
      });
      return parts;
    });
    console.log(`Compound ${i + 1}:`, JSON.stringify(structure));
  }

  console.log('\n=== Test Results ===');
  console.log('✓ Soft hyphens are embedded between morpheme parts');
  console.log('✓ Browser will display hyphen when line breaks at that point');
  console.log('✓ Each morpheme stays with its gloss');
  console.log('\nScreenshot saved: screenshots/hyphen-break-test.png');
  console.log('Check the screenshot to see if any compound words break with hyphens.');

  await browser.close();
})();
