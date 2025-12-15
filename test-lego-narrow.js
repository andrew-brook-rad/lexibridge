const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('Navigating to http://localhost:3003...');
  await page.goto('http://localhost:3003', { waitUntil: 'networkidle0' });

  // Check if there's already translated content from previous test
  const wordUnits = await page.$$('.word-unit');
  console.log('Word units found:', wordUnits.length);

  if (wordUnits.length > 0) {
    console.log('Using existing translated content...');

    // Change to custom page size with very narrow width
    console.log('Setting custom narrow width (4 inches)...');
    await page.select('select', 'custom');
    await new Promise(r => setTimeout(r, 300));

    // Set custom width to 4 inches (very narrow to force line breaks)
    const widthInput = await page.$('input[type="number"][placeholder="Width"]');
    if (widthInput) {
      await widthInput.click({ clickCount: 3 }); // Select all
      await widthInput.type('4');
    } else {
      // Try finding by label
      const inputs = await page.$$('input[type="number"]');
      for (const input of inputs) {
        const value = await input.evaluate(el => el.value);
        if (value === '6' || value === '5.5') {
          await input.click({ clickCount: 3 });
          await input.type('4');
          break;
        }
      }
    }
    await new Promise(r => setTimeout(r, 300));

    // Click Reflow button
    const reflowBtn = await page.$('button.bg-blue-600');
    if (reflowBtn) {
      await reflowBtn.click();
      await new Promise(r => setTimeout(r, 500));
    }

    await page.screenshot({ path: 'screenshots/lego-04-very-narrow.png', fullPage: true });
    console.log('Screenshot saved: lego-04-very-narrow.png');

    // Get preview width
    const previewWidth = await page.$eval('.print-preview', el => el.offsetWidth);
    console.log('Preview width:', previewWidth, 'px');

    // Check if any compound words exist
    const compounds = await page.$$('.word-unit.compound');
    console.log('Compound words:', compounds.length);

    // Check if soft hyphens are present
    const softHyphens = await page.$$('.soft-hyphen');
    console.log('Soft hyphen elements:', softHyphens.length);

    // Check the HTML structure
    const html = await page.$eval('.print-preview', el => el.innerHTML.substring(0, 2000));
    console.log('\nSample HTML (first 2000 chars):');
    console.log(html);

  } else {
    console.log('No translated content found. Run test-lego-method.js first.');
  }

  await browser.close();
})();
