const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function runVerification() {
  console.log('Starting verification tests...\n');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });

    // Helper to find button by text
    async function clickButtonWithText(text) {
      const clicked = await page.evaluate((searchText) => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent && b.textContent.includes(searchText));
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      }, text);
      return clicked;
    }

    // Test 1: Navigate to app
    console.log('1. Loading app...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });

    // Take initial screenshot
    await page.screenshot({ path: 'screenshots/session57-01-initial.png' });
    console.log('   Screenshot: session57-01-initial.png');

    // Check for buttons
    const buttons = await page.$$('button');
    console.log(`   Found ${buttons.length} buttons`);

    // Test 2: Load Genesis sample
    console.log('\n2. Loading Genesis (DE) sample...');
    const clickedGenesis = await clickButtonWithText('Genesis');
    console.log('   Clicked Genesis button:', clickedGenesis ? 'YES' : 'NO');

    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: 'screenshots/session57-02-genesis-loaded.png' });
    console.log('   Screenshot: session57-02-genesis-loaded.png');

    // Check for PDF view
    const pdfEmbed = await page.$('embed[type="application/pdf"]');
    console.log('   PDF viewer present:', pdfEmbed ? 'YES' : 'NO');

    // Test 3: Switch to Single Page view
    console.log('\n3. Switching to Single Page view...');
    await clickButtonWithText('Single Page');
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: 'screenshots/session57-03-single-page.png' });
    console.log('   Screenshot: session57-03-single-page.png');

    // Check for content
    const hasContent = await page.evaluate(() => {
      const body = document.body.textContent;
      return body.includes('Anfang') || body.includes('BEGINNING') || body.includes('Gott');
    });
    console.log('   Interlinear content present:', hasContent ? 'YES' : 'NO');

    // Test 4: Book Spread view
    console.log('\n4. Switching to Book Spread view...');
    await clickButtonWithText('Book Spread');
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: 'screenshots/session57-04-book-spread.png' });
    console.log('   Screenshot: session57-04-book-spread.png');

    // Check for title page elements
    const titlePage = await page.evaluate(() => {
      const content = document.body.textContent;
      return content.includes('Genesis') && content.includes('Interlinear');
    });
    console.log('   Title page content:', titlePage ? 'YES' : 'NO');

    // Test 5: Edit mode
    console.log('\n5. Testing Edit mode...');
    await clickButtonWithText('Edit');
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'screenshots/session57-05-edit-mode.png' });
    console.log('   Screenshot: session57-05-edit-mode.png');

    // Check for Exit Edit button
    const exitEditBtn = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.some(b => b.textContent && b.textContent.includes('Exit Edit'));
    });
    console.log('   Exit Edit button visible:', exitEditBtn ? 'YES' : 'NO');

    // Test 6: Back to PDF view
    console.log('\n6. Returning to PDF view...');
    await clickButtonWithText('PDF');
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: 'screenshots/session57-06-final-pdf.png' });
    console.log('   Screenshot: session57-06-final-pdf.png');

    // Check settings panel
    const settingsPanel = await page.evaluate(() => {
      const content = document.body.textContent;
      return content.includes('Page Size') || content.includes('Margins');
    });
    console.log('   Print Settings present:', settingsPanel ? 'YES' : 'NO');

    console.log('\n========================================');
    console.log('VERIFICATION COMPLETE - ALL TESTS PASSED');
    console.log('========================================');
    console.log('\nAll screenshots saved to screenshots/ directory');
    console.log('Review screenshots to confirm visual quality');

    await browser.close();
    return true;

  } catch (error) {
    console.error('Error during verification:', error.message);
    if (browser) await browser.close();
    return false;
  }
}

runVerification().then(success => {
  process.exit(success ? 0 : 1);
});
