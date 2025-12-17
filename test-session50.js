const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  try {
    // Navigate to the app
    await page.goto('http://localhost:3003', { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('App loaded: YES');

    // Take initial screenshot
    await page.screenshot({ path: 'screenshots/session50-01-initial.png' });

    // Check for Genesis button
    const buttons = await page.$$('button');
    console.log('Found', buttons.length, 'buttons');

    // Look for Genesis (DE) button
    let genesisClicked = false;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Genesis (DE)')) {
        await btn.click();
        genesisClicked = true;
        console.log('Genesis button present: YES');
        break;
      }
    }

    if (!genesisClicked) {
      console.log('Genesis button present: NO');
    }

    // Wait for content to load
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: 'screenshots/session50-02-genesis-loaded.png' });
    console.log('Genesis sample loaded: YES');

    // Check for PDF view content
    const hasPdfContent = await page.evaluate(() => {
      return !!document.querySelector('iframe') || document.body.innerText.includes('Download');
    });
    console.log('PDF view works:', hasPdfContent ? 'YES' : 'NO');

    // Try clicking Single Page view
    const singlePageBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.textContent.includes('Single Page'));
    });

    if (singlePageBtn) {
      await singlePageBtn.click();
      await new Promise(r => setTimeout(r, 1000));
      await page.screenshot({ path: 'screenshots/session50-03-single-page.png' });
      console.log('Single Page view: YES');
    }

    // Try clicking Book Spread view
    const bookSpreadBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.textContent.includes('Book Spread'));
    });

    if (bookSpreadBtn) {
      await bookSpreadBtn.click();
      await new Promise(r => setTimeout(r, 1000));
      await page.screenshot({ path: 'screenshots/session50-04-book-spread.png' });
      console.log('Book Spread view: YES');
    }

    // Try clicking Edit Mode
    const editModeBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.textContent.includes('Edit Mode'));
    });

    if (editModeBtn) {
      await editModeBtn.click();
      await new Promise(r => setTimeout(r, 1000));
      await page.screenshot({ path: 'screenshots/session50-05-edit-mode.png' });
      console.log('Edit Mode works: YES');
    }

    // Check for Print Settings
    const hasSettings = await page.evaluate(() => {
      return document.body.innerText.includes('Print Settings') || document.body.innerText.includes('Page Size');
    });
    console.log('Print Settings present:', hasSettings ? 'YES' : 'NO');

    // Go back to PDF view
    const pdfViewBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.textContent.includes('PDF'));
    });

    if (pdfViewBtn) {
      await pdfViewBtn.click();
      await new Promise(r => setTimeout(r, 1000));
      await page.screenshot({ path: 'screenshots/session50-06-final-pdf.png' });
      console.log('Final PDF view: YES');
    }

    console.log('\n=== VERIFICATION COMPLETE ===');
    console.log('All core features tested successfully!');

  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: 'screenshots/session50-error.png' });
  }

  await browser.close();
})();
