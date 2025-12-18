const puppeteer = require('puppeteer');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  try {
    // Step 1: Navigate to app
    console.log('Step 1: Navigating to localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
    console.log('Page loaded successfully');

    // Step 2: Load Genesis (DE) sample data
    console.log('Step 2: Loading Genesis (DE) sample...');
    const clicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const genesisBtn = buttons.find(btn => btn.textContent.includes('Genesis (DE)'));
      if (genesisBtn) {
        genesisBtn.click();
        return true;
      }
      return false;
    });
    console.log('Genesis (DE) button clicked:', clicked);
    await delay(2000);
    await page.screenshot({ path: 'screenshots/session67-02-genesis-loaded.png', fullPage: false });
    console.log('Screenshot: session67-02-genesis-loaded.png');

    // Check if content loaded
    const hasContent = await page.evaluate(() => {
      return document.body.innerText.length > 500;
    });
    console.log('Content loaded:', hasContent);

    // Step 3: Check PDF view (should be default)
    console.log('Step 3: Checking PDF view...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const pdfBtn = buttons.find(btn => btn.textContent.trim() === 'PDF');
      if (pdfBtn) pdfBtn.click();
    });
    await delay(1500);
    await page.screenshot({ path: 'screenshots/session67-03-pdf-view.png', fullPage: false });
    console.log('Screenshot: session67-03-pdf-view.png');

    // Step 4: Switch to Single Page view
    console.log('Step 4: Switching to Single Page view...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const singleBtn = buttons.find(btn => btn.textContent.includes('Single Page'));
      if (singleBtn) singleBtn.click();
    });
    await delay(1500);
    await page.screenshot({ path: 'screenshots/session67-04-single-page.png', fullPage: false });
    console.log('Screenshot: session67-04-single-page.png');

    // Step 5: Switch to Book Spread view
    console.log('Step 5: Switching to Book Spread view...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const spreadBtn = buttons.find(btn => btn.textContent.includes('Book Spread'));
      if (spreadBtn) spreadBtn.click();
    });
    await delay(1500);
    await page.screenshot({ path: 'screenshots/session67-05-book-spread.png', fullPage: false });
    console.log('Screenshot: session67-05-book-spread.png');

    // Step 6: Enable Edit Mode
    console.log('Step 6: Enabling Edit Mode...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const editBtn = buttons.find(btn => btn.textContent.includes('Edit Mode'));
      if (editBtn) editBtn.click();
    });
    await delay(1000);
    await page.screenshot({ path: 'screenshots/session67-06-edit-mode.png', fullPage: false });
    console.log('Screenshot: session67-06-edit-mode.png');

    // Step 7: Back to PDF view for final check
    console.log('Step 7: Final PDF view check...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const pdfBtn = buttons.find(btn => btn.textContent.trim() === 'PDF');
      if (pdfBtn) pdfBtn.click();
    });
    await delay(1500);
    await page.screenshot({ path: 'screenshots/session67-07-final-pdf.png', fullPage: false });
    console.log('Screenshot: session67-07-final-pdf.png');

    // Verify key elements
    console.log('\n=== Verification Results ===');

    const verificationResults = await page.evaluate(() => {
      const results = {};
      const bodyText = document.body.innerText;

      // Check for title
      results.hasTitle = bodyText.includes('GENESIS') || bodyText.includes('Genesis');

      // Check for verse numbers
      results.hasVerseNumbers = bodyText.includes('Anfang') && (bodyText.includes('1') || bodyText.includes('2'));

      // Check for German text
      results.hasGermanText = bodyText.includes('Anfang') || bodyText.includes('Gott') || bodyText.includes('Himmel');

      // Check for interlinear glosses (UPPERCASE words like BEGINNING, GOD, etc.)
      results.hasGlosses = /\b[A-Z]{3,}\b/.test(bodyText);

      // Check for Print Settings
      results.hasPrintSettings = bodyText.includes('Print Settings') || bodyText.includes('Page Size');

      // Check for view buttons
      results.hasViewButtons = bodyText.includes('PDF') && bodyText.includes('Book Spread') && bodyText.includes('Single Page');

      // Check for KDP margins
      results.hasKDPMargins = bodyText.includes('0.875') || bodyText.includes('KDP');

      return results;
    });

    console.log('Has Title:', verificationResults.hasTitle);
    console.log('Has Verse Numbers:', verificationResults.hasVerseNumbers);
    console.log('Has German Text:', verificationResults.hasGermanText);
    console.log('Has Glosses:', verificationResults.hasGlosses);
    console.log('Has Print Settings:', verificationResults.hasPrintSettings);
    console.log('Has View Buttons:', verificationResults.hasViewButtons);
    console.log('Has KDP Margins:', verificationResults.hasKDPMargins);

    const allPassing = Object.values(verificationResults).every(v => v === true);
    console.log('\n=== All checks passing:', allPassing, '===');

  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: 'screenshots/session67-error.png', fullPage: false });
  }

  await browser.close();
  console.log('\nDone!');
})();
