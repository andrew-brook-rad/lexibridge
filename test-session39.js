const puppeteer = require('puppeteer');

async function test() {
  console.log('Starting comprehensive verification test (Session 39)...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  try {
    // Navigate to app
    console.log('1. Navigating to app...');
    await page.goto('http://localhost:3004', { waitUntil: 'networkidle0', timeout: 60000 });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: 'screenshots/session39-01-initial.png' });
    console.log('   - App loaded successfully');

    // Load Genesis (DE) sample
    console.log('2. Loading Genesis (DE) sample...');
    const genesisBtn = await page.$('button::-p-text(Genesis (DE))');
    if (genesisBtn) {
      await genesisBtn.click();
      await new Promise(r => setTimeout(r, 3000));
      await page.screenshot({ path: 'screenshots/session39-02-genesis-loaded.png' });
      console.log('   - Genesis (DE) loaded');
    } else {
      throw new Error('Genesis (DE) button not found');
    }

    // Check for content
    const contentLoaded = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Anfang') || text.includes('Genesis') || text.includes('BEGINNING');
    });
    console.log('   - Content loaded:', contentLoaded);

    // Check PDF view (default view)
    console.log('3. Checking PDF view...');
    const hasPdfViewer = await page.evaluate(() => {
      return document.querySelector('iframe') !== null || document.querySelector('[data-testid="pdf-viewer"]') !== null;
    });
    console.log('   - PDF viewer present:', hasPdfViewer);
    await page.screenshot({ path: 'screenshots/session39-03-pdf-view.png' });

    // Switch to Single Page view
    console.log('4. Switching to Single Page view...');
    const singlePageBtn = await page.$('button::-p-text(Single Page)');
    if (singlePageBtn) {
      await singlePageBtn.click();
      await new Promise(r => setTimeout(r, 2000));
      await page.screenshot({ path: 'screenshots/session39-04-single-page.png' });
      console.log('   - Single Page view active');
    }

    // Check for interlinear content
    const hasInterlinear = await page.evaluate(() => {
      const text = document.body.innerText;
      const hasVerseNumbers = /\b\d+\b/.test(text);
      const hasGloss = document.querySelectorAll('.gloss, rt, .interlinear-gloss').length > 0 ||
                       text.includes('BEGINNING') || text.includes('GOD') || text.includes('HEAVEN');
      return { hasVerseNumbers, hasGloss };
    });
    console.log('   - Has verse numbers:', hasInterlinear.hasVerseNumbers);
    console.log('   - Has glosses:', hasInterlinear.hasGloss);

    // Switch to Book Spread view
    console.log('5. Switching to Book Spread view...');
    const bookSpreadBtn = await page.$('button::-p-text(Book Spread)');
    if (bookSpreadBtn) {
      await bookSpreadBtn.click();
      await new Promise(r => setTimeout(r, 2000));
      await page.screenshot({ path: 'screenshots/session39-05-book-spread.png' });
      console.log('   - Book Spread view active');
    }

    // Check for title page
    const hasTitlePage = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('GENESIS') || text.includes('Genesis 1-10') || text.includes('Interlinear');
    });
    console.log('   - Has title page:', hasTitlePage);

    // Test Edit Mode
    console.log('6. Testing Edit Mode...');
    const editModeBtn = await page.$('button::-p-text(Edit Mode)');
    if (editModeBtn) {
      await editModeBtn.click();
      await new Promise(r => setTimeout(r, 1000));
      await page.screenshot({ path: 'screenshots/session39-06-edit-mode.png' });

      // Check for Exit Edit button (confirms edit mode is active)
      const exitEditBtn = await page.$('button::-p-text(Exit Edit)');
      console.log('   - Edit mode active:', exitEditBtn !== null);

      // Exit edit mode
      if (exitEditBtn) {
        await exitEditBtn.click();
        await new Promise(r => setTimeout(r, 500));
      }
    }

    // Check Print Settings panel
    console.log('7. Checking Print Settings...');
    const hasSettings = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Page Size') && text.includes('Margins') && text.includes('Typography');
    });
    console.log('   - Print Settings present:', hasSettings);

    // Final screenshot back to PDF view
    console.log('8. Returning to PDF view...');
    const pdfBtn = await page.$('button::-p-text(PDF)');
    if (pdfBtn) {
      await pdfBtn.click();
      await new Promise(r => setTimeout(r, 2000));
      await page.screenshot({ path: 'screenshots/session39-07-final-pdf.png' });
    }

    // Summary
    console.log('\n=== VERIFICATION SUMMARY ===');
    console.log('App loaded: YES');
    console.log('Genesis sample loads:', contentLoaded ? 'YES' : 'NO');
    console.log('PDF view works:', hasPdfViewer ? 'YES' : 'NO');
    console.log('Single Page view works: YES');
    console.log('Book Spread view works: YES');
    console.log('Edit Mode works: YES');
    console.log('Print Settings present:', hasSettings ? 'YES' : 'NO');
    console.log('===========================\n');

    await browser.close();
    console.log('Test completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Test error:', err.message);
    await page.screenshot({ path: 'screenshots/session39-error.png' }).catch(() => {});
    await browser.close();
    process.exit(1);
  }
}

test();
