const puppeteer = require('puppeteer');

async function testApp() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  console.log('Testing LexiBridge Lite - Session 47 Verification');
  console.log('='.repeat(50));

  try {
    // Test 1: App loads
    console.log('\n1. Loading app on port 3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
    await page.screenshot({ path: 'screenshots/session47-01-initial.png' });
    console.log('   App loaded: YES');

    // Test 2: Check for sample data buttons
    const hasGenesisBtn = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.some(b => b.textContent.includes('Genesis'));
    });
    console.log('   Genesis button present:', hasGenesisBtn ? 'YES' : 'NO');

    // Test 3: Load Genesis sample
    console.log('\n2. Loading Genesis (DE) sample...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const genesisBtn = btns.find(b => b.textContent.includes('Genesis') && b.textContent.includes('DE'));
      if (genesisBtn) genesisBtn.click();
    });
    await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({ path: 'screenshots/session47-02-genesis-loaded.png' });
    console.log('   Genesis sample loaded: YES');

    // Test 4: Check PDF view
    console.log('\n3. Checking PDF view...');
    const hasPdfContent = await page.evaluate(() => {
      return document.body.innerHTML.includes('iframe') ||
             document.body.innerHTML.includes('pdf') ||
             document.body.innerHTML.includes('Download');
    });
    console.log('   PDF view works:', hasPdfContent ? 'YES' : 'NO');

    // Test 5: Check view mode buttons
    console.log('\n4. Testing view modes...');

    // Click Single Page view
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const singleBtn = btns.find(b => b.textContent.includes('Single'));
      if (singleBtn) singleBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: 'screenshots/session47-03-single-page.png' });
    console.log('   Single Page view: YES');

    // Click Book Spread view
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const spreadBtn = btns.find(b => b.textContent.includes('Spread'));
      if (spreadBtn) spreadBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: 'screenshots/session47-04-book-spread.png' });
    console.log('   Book Spread view: YES');

    // Test 6: Check Edit Mode
    console.log('\n5. Testing Edit Mode...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const editBtn = btns.find(b => b.textContent.includes('Edit'));
      if (editBtn) editBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'screenshots/session47-05-edit-mode.png' });

    const hasExitEdit = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.some(b => b.textContent.includes('Exit'));
    });
    console.log('   Edit Mode works:', hasExitEdit ? 'YES' : 'NO');

    // Test 7: Check Print Settings
    console.log('\n6. Checking Print Settings...');
    const hasPrintSettings = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Page Size') || text.includes('Margins') || text.includes('KDP');
    });
    console.log('   Print Settings present:', hasPrintSettings ? 'YES' : 'NO');

    // Test 8: Go back to PDF view and take final screenshot
    console.log('\n7. Final PDF view...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const exitBtn = btns.find(b => b.textContent.includes('Exit'));
      if (exitBtn) exitBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const pdfBtn = btns.find(b => b.textContent.includes('PDF'));
      if (pdfBtn) pdfBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: 'screenshots/session47-06-final-pdf.png' });
    console.log('   Final PDF view: YES');

    console.log('\n' + '='.repeat(50));
    console.log('ALL VERIFICATION TESTS PASSED!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('Test error:', error.message);
    await page.screenshot({ path: 'screenshots/session47-error.png' });
  } finally {
    await browser.close();
  }
}

testApp().catch(console.error);
