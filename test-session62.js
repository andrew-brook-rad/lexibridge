const puppeteer = require('puppeteer');
const path = require('path');

const PORT = 3004;
const BASE_URL = `http://localhost:${PORT}`;
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('SESSION 62 VERIFICATION - LexiBridge Lite');
  console.log('='.repeat(60));
  console.log('');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  try {
    // Test 1: Load main page
    console.log('Test 1: Loading main page...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'session62-01-initial.png') });
    console.log('  PASS: Main page loaded');
    console.log('');

    // Test 2: Load Genesis sample
    console.log('Test 2: Loading Genesis sample...');
    const buttons = await page.$$('button');
    console.log(`  Found ${buttons.length} buttons`);

    // Find and click Genesis button
    let genesisLoaded = false;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Genesis')) {
        await btn.click();
        await delay(2000);
        genesisLoaded = true;
        break;
      }
    }
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'session62-02-genesis-loaded.png') });
    console.log(`  Genesis sample loaded: ${genesisLoaded ? 'YES' : 'NO'}`);
    console.log('');

    // Test 3: Check PDF view
    console.log('Test 3: Testing PDF view...');
    const pdfButtons = await page.$$('button');
    for (const btn of pdfButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('PDF')) {
        await btn.click();
        await delay(2000);
        break;
      }
    }
    const hasPdfEmbed = await page.$('embed, iframe, object');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'session62-03-pdf-view.png') });
    console.log(`  PDF view available: ${hasPdfEmbed ? 'YES' : 'Check screenshot'}`);
    console.log('');

    // Test 4: Check Single Page view
    console.log('Test 4: Testing Single Page view...');
    const allButtons = await page.$$('button');
    for (const btn of allButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Single')) {
        await btn.click();
        await delay(1000);
        break;
      }
    }
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'session62-04-single-page.png') });
    console.log('  Single Page view: Check screenshot');
    console.log('');

    // Test 5: Check Book Spread view
    console.log('Test 5: Testing Book Spread view...');
    const spreadButtons = await page.$$('button');
    for (const btn of spreadButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Spread')) {
        await btn.click();
        await delay(1000);
        break;
      }
    }
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'session62-05-book-spread.png') });
    console.log('  Book Spread view: Check screenshot');
    console.log('');

    // Test 6: Check Edit Mode
    console.log('Test 6: Testing Edit Mode...');
    const editButtons = await page.$$('button');
    for (const btn of editButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && (text.includes('Edit Mode') || text.includes('Enter Edit'))) {
        await btn.click();
        await delay(500);
        break;
      }
    }
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'session62-06-edit-mode.png') });
    const exitEditBtn = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent && btn.textContent.includes('Exit Edit')) {
          return true;
        }
      }
      return false;
    });
    console.log(`  Edit Mode toggle works: ${exitEditBtn ? 'YES' : 'NO'}`);
    console.log('');

    // Test 7: Check Print Settings panel
    console.log('Test 7: Checking Print Settings panel...');
    const pageContent = await page.content();
    const hasSettingsPanel = pageContent.includes('Print Settings') ||
                            pageContent.includes('Page Size') ||
                            pageContent.includes('KDP');
    console.log(`  Print Settings present: ${hasSettingsPanel ? 'YES' : 'NO'}`);
    console.log('');

    // Test 8: Final PDF view
    console.log('Test 8: Final PDF view...');
    const finalButtons = await page.$$('button');
    for (const btn of finalButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('PDF')) {
        await btn.click();
        await delay(2000);
        break;
      }
    }
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'session62-07-final-pdf.png') });
    console.log('  Final PDF view: Check screenshot');
    console.log('');

    // Summary
    console.log('='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));
    console.log('All tests completed. Screenshots saved in screenshots/ directory.');
    console.log('');
    console.log('Screenshots to verify:');
    console.log('  - session62-01-initial.png - App initial state');
    console.log('  - session62-02-genesis-loaded.png - Genesis sample loaded');
    console.log('  - session62-03-pdf-view.png - PDF view');
    console.log('  - session62-04-single-page.png - Single page with justified text');
    console.log('  - session62-05-book-spread.png - Book spread with title page');
    console.log('  - session62-06-edit-mode.png - Edit mode active');
    console.log('  - session62-07-final-pdf.png - Final PDF view');
    console.log('');

  } catch (error) {
    console.error('Test error:', error.message);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'session62-error.png') });
  } finally {
    await browser.close();
  }
}

runTests().catch(console.error);
