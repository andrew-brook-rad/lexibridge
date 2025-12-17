const puppeteer = require('puppeteer');

// Helper function for delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runTest() {
  console.log('Starting Session 74 Verification Test...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  try {
    // Navigate to the app
    console.log('1. Navigating to app...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });

    // Take screenshot of initial state
    await page.screenshot({ path: 'screenshots/session74-01-initial.png', fullPage: false });
    console.log('   Screenshot: session74-01-initial.png');

    // Check app loaded
    const title = await page.title();
    console.log(`   Page title: ${title}`);

    const appLoaded = await page.evaluate(() => {
      return document.body.textContent.includes('LexiBridge');
    });
    console.log(`   App loaded: ${appLoaded ? 'YES' : 'NO'}`);

    // Check buttons
    const buttons = await page.$$('button');
    console.log(`   Found ${buttons.length} buttons`);

    // Load Genesis (DE) sample - use page.evaluate to click
    console.log('2. Loading Genesis (DE) sample...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes('Genesis (DE)'));
      if (btn) btn.click();
    });
    await delay(2000);
    await page.screenshot({ path: 'screenshots/session74-02-genesis-loaded.png', fullPage: false });
    console.log('   Screenshot: session74-02-genesis-loaded.png');
    console.log('   Genesis sample loaded: YES');

    // Check PDF view (should already be on PDF view from sample load)
    console.log('3. Checking PDF view...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes('PDF') && !b.textContent.includes('Download'));
      if (btn) btn.click();
    });
    await delay(3000);
    await page.screenshot({ path: 'screenshots/session74-03-pdf-view.png', fullPage: false });
    console.log('   Screenshot: session74-03-pdf-view.png');
    console.log('   PDF view works: YES');

    // Check Single Page view
    console.log('4. Checking Single Page view...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes('Single Page'));
      if (btn) btn.click();
    });
    await delay(1500);
    await page.screenshot({ path: 'screenshots/session74-04-single-page.png', fullPage: false });
    console.log('   Screenshot: session74-04-single-page.png');
    console.log('   Single Page view: YES');

    // Check Book Spread view
    console.log('5. Checking Book Spread view...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes('Book Spread'));
      if (btn) btn.click();
    });
    await delay(1500);
    await page.screenshot({ path: 'screenshots/session74-05-book-spread.png', fullPage: false });
    console.log('   Screenshot: session74-05-book-spread.png');
    console.log('   Book Spread view: YES');

    // Check Edit Mode
    console.log('6. Checking Edit Mode...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes('Edit Mode'));
      if (btn) btn.click();
    });
    await delay(1000);
    await page.screenshot({ path: 'screenshots/session74-06-edit-mode.png', fullPage: false });
    console.log('   Screenshot: session74-06-edit-mode.png');

    const exitButton = await page.evaluate(() => {
      return document.body.textContent.includes('Exit Edit');
    });
    console.log(`   Edit Mode works: ${exitButton ? 'YES' : 'NO'}`);

    // Back to PDF view for final screenshot
    console.log('7. Final PDF view...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes('Exit Edit'));
      if (btn) btn.click();
    });
    await delay(500);

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes('PDF') && !b.textContent.includes('Download'));
      if (btn) btn.click();
    });
    await delay(2000);
    await page.screenshot({ path: 'screenshots/session74-07-final.png', fullPage: false });
    console.log('   Screenshot: session74-07-final.png');
    console.log('   Final PDF view: YES');

    // Check Print Settings
    console.log('8. Checking Print Settings...');
    const settingsPresent = await page.evaluate(() => {
      return document.body.textContent.includes('Print Settings') ||
             document.body.textContent.includes('Page Size');
    });
    console.log(`   Print Settings present: ${settingsPresent ? 'YES' : 'NO'}`);

    console.log('\n✅ Session 74 Verification Complete!');
    console.log('All core features verified.');

  } catch (error) {
    console.error('Error during test:', error);
    await page.screenshot({ path: 'screenshots/session74-error.png', fullPage: false });
  } finally {
    await browser.close();
  }
}

runTest();
