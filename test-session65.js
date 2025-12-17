const puppeteer = require('puppeteer');
const path = require('path');

async function runTests() {
  console.log('Starting verification tests...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  try {
    // Test 1: Load the app
    console.log('\n1. Loading app...');
    await page.goto('http://localhost:3007', { waitUntil: 'networkidle0', timeout: 30000 });
    await page.screenshot({ path: 'screenshots/session65-01-initial.png' });
    console.log('   Screenshot: session65-01-initial.png');

    // Test 2: Load Genesis sample
    console.log('\n2. Loading Genesis sample...');
    await page.waitForSelector('button', { timeout: 5000 });
    const buttons = await page.$$('button');
    let genesisButton = null;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Genesis')) {
        genesisButton = btn;
        break;
      }
    }

    if (genesisButton) {
      await genesisButton.click();
      await new Promise(r => setTimeout(r, 2000));
      await page.screenshot({ path: 'screenshots/session65-02-genesis-loaded.png' });
      console.log('   Genesis sample loaded');
      console.log('   Screenshot: session65-02-genesis-loaded.png');
    } else {
      console.log('   WARNING: Genesis button not found');
    }

    // Test 3: Check for view mode buttons and try Single Page
    console.log('\n3. Testing Single Page view...');
    const allButtons = await page.$$('button');
    for (const btn of allButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Single')) {
        await btn.click();
        await new Promise(r => setTimeout(r, 1500));
        break;
      }
    }
    await page.screenshot({ path: 'screenshots/session65-03-single-page.png' });
    console.log('   Screenshot: session65-03-single-page.png');

    // Test 4: Book Spread view
    console.log('\n4. Testing Book Spread view...');
    const buttons2 = await page.$$('button');
    for (const btn of buttons2) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Spread')) {
        await btn.click();
        await new Promise(r => setTimeout(r, 1500));
        break;
      }
    }
    await page.screenshot({ path: 'screenshots/session65-04-book-spread.png' });
    console.log('   Screenshot: session65-04-book-spread.png');

    // Test 5: Edit Mode
    console.log('\n5. Testing Edit Mode...');
    const buttons3 = await page.$$('button');
    for (const btn of buttons3) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Edit')) {
        await btn.click();
        await new Promise(r => setTimeout(r, 1500));
        break;
      }
    }
    await page.screenshot({ path: 'screenshots/session65-05-edit-mode.png' });
    console.log('   Screenshot: session65-05-edit-mode.png');

    // Test 6: PDF view
    console.log('\n6. Testing PDF view...');
    const buttons4 = await page.$$('button');
    for (const btn of buttons4) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('PDF')) {
        await btn.click();
        await new Promise(r => setTimeout(r, 2000));
        break;
      }
    }
    await page.screenshot({ path: 'screenshots/session65-06-final-pdf.png' });
    console.log('   Screenshot: session65-06-final-pdf.png');

    // Check page content for key elements
    console.log('\n7. Verifying page content...');
    const pageContent = await page.content();

    const checks = [
      { name: 'LexiBridge branding', test: pageContent.includes('LexiBridge') },
      { name: 'Print Settings', test: pageContent.includes('Print Settings') || pageContent.includes('Settings') },
      { name: 'Genesis content', test: pageContent.includes('Genesis') || pageContent.includes('Anfang') },
    ];

    for (const check of checks) {
      console.log(`   ${check.name}: ${check.test ? 'PASS' : 'FAIL'}`);
    }

    console.log('\n=== VERIFICATION COMPLETE ===');
    console.log('All screenshots saved to screenshots/ directory');

  } catch (error) {
    console.error('Test error:', error.message);
    await page.screenshot({ path: 'screenshots/session65-error.png' });
  } finally {
    await browser.close();
  }
}

runTests().catch(console.error);
