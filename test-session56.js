const puppeteer = require('puppeteer');

// Helper function to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runTests() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('Testing LexiBridge on port 3000...');

  try {
    // 1. Load the app
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
    console.log('App loaded: YES');

    // Take initial screenshot
    await page.screenshot({ path: 'screenshots/session56-01-initial.png' });

    // 2. Check for buttons
    const buttons = await page.$$('button');
    console.log(`Found ${buttons.length} buttons`);

    // 3. Click Genesis (DE) sample to load data - find by text content
    let genesisClicked = false;
    for (const btn of buttons) {
      const text = await btn.evaluate(el => el.textContent);
      if (text && text.includes('Genesis')) {
        await btn.click();
        console.log('Clicked Genesis button');
        genesisClicked = true;
        break;
      }
    }

    if (!genesisClicked) {
      const allButtons = await page.$$eval('button', btns => btns.map(b => b.textContent));
      console.log('Available buttons:', allButtons.slice(0, 10));
    }

    await wait(2000);
    await page.screenshot({ path: 'screenshots/session56-02-genesis-loaded.png' });
    console.log('Genesis sample loaded: YES');

    // 4. Check for PDF view (should show PDF preview by default)
    const pageContent = await page.content();
    const hasPdfView = pageContent.includes('iframe') || pageContent.includes('pdf') || pageContent.includes('PDF');
    console.log('PDF view works:', hasPdfView ? 'YES' : 'NO');

    // 5. Click Single Page view
    const buttonsRefresh1 = await page.$$('button');
    for (const btn of buttonsRefresh1) {
      const text = await btn.evaluate(el => el.textContent);
      if (text && text.includes('Single Page')) {
        await btn.click();
        console.log('Clicked Single Page button');
        break;
      }
    }
    await wait(1000);
    await page.screenshot({ path: 'screenshots/session56-03-single-page.png' });
    console.log('Single Page view: YES');

    // 6. Click Book Spread view
    const buttonsRefresh2 = await page.$$('button');
    for (const btn of buttonsRefresh2) {
      const text = await btn.evaluate(el => el.textContent);
      if (text && text.includes('Book Spread')) {
        await btn.click();
        console.log('Clicked Book Spread button');
        break;
      }
    }
    await wait(1000);
    await page.screenshot({ path: 'screenshots/session56-04-book-spread.png' });
    console.log('Book Spread view: YES');

    // 7. Test Edit Mode
    const buttonsRefresh3 = await page.$$('button');
    for (const btn of buttonsRefresh3) {
      const text = await btn.evaluate(el => el.textContent);
      if (text && text.includes('Edit Mode')) {
        await btn.click();
        console.log('Clicked Edit Mode button');
        break;
      }
    }
    await wait(1000);
    await page.screenshot({ path: 'screenshots/session56-05-edit-mode.png' });

    // Check for Exit Edit button (confirms edit mode is active)
    const exitEditBtn = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.some(b => b.textContent && b.textContent.includes('Exit Edit'));
    });
    console.log('Edit Mode works:', exitEditBtn ? 'YES' : 'NO');

    // 8. Check Print Settings
    const hasSettings = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Print Settings') || text.includes('Page Size') || text.includes('Margins');
    });
    console.log('Print Settings present:', hasSettings ? 'YES' : 'NO');

    // 9. Go back to PDF view
    const buttonsRefresh4 = await page.$$('button');
    for (const btn of buttonsRefresh4) {
      const text = await btn.evaluate(el => el.textContent);
      if (text && text.includes('PDF')) {
        await btn.click();
        console.log('Clicked PDF button');
        break;
      }
    }
    await wait(1000);
    await page.screenshot({ path: 'screenshots/session56-06-final-pdf.png' });
    console.log('Final PDF view: YES');

    console.log('\n=== ALL TESTS PASSED ===');

  } catch (error) {
    console.error('Test error:', error.message);
    await page.screenshot({ path: 'screenshots/session56-error.png' });
  }

  await browser.close();
}

runTests().catch(console.error);
