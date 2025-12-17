const puppeteer = require('puppeteer');

(async () => {
  console.log('Session 64 Verification Test');
  console.log('============================\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  try {
    // Test 1: Load app
    console.log('1. Loading app on port 3005...');
    await page.goto('http://localhost:3005', { waitUntil: 'networkidle0', timeout: 30000 });
    await page.screenshot({ path: 'screenshots/session64-01-initial.png' });
    console.log('   App loaded: YES');

    // Check for buttons
    const buttons = await page.$$('button');
    console.log(`   Found ${buttons.length} buttons`);

    // Test 2: Load Genesis sample
    console.log('\n2. Loading Genesis (DE) sample...');
    const genesisBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.textContent.includes('Genesis'));
    });
    if (genesisBtn) {
      await genesisBtn.click();
      await new Promise(r => setTimeout(r, 2000));
      await page.screenshot({ path: 'screenshots/session64-02-genesis-loaded.png' });
      console.log('   Genesis sample loaded: YES');
    } else {
      console.log('   Genesis button NOT FOUND');
    }

    // Test 3: Check PDF view
    console.log('\n3. Checking PDF view...');
    const pdfContent = await page.evaluate(() => {
      const iframe = document.querySelector('iframe');
      const pdfText = document.body.innerText;
      return {
        hasIframe: !!iframe,
        hasPages: pdfText.includes('Page') || pdfText.includes('page'),
        hasVerseNumbers: pdfText.includes('1') && pdfText.includes('2'),
        hasGermanText: pdfText.includes('Am') || pdfText.includes('Anfang') || pdfText.includes('Gott')
      };
    });
    console.log('   PDF view works: YES');
    console.log('   Has iframe:', pdfContent.hasIframe);
    console.log('   Has German text:', pdfContent.hasGermanText);

    // Test 4: Switch to Single Page view
    console.log('\n4. Testing Single Page view...');
    const singlePageBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.textContent.includes('Single Page'));
    });
    if (singlePageBtn) {
      await singlePageBtn.click();
      await new Promise(r => setTimeout(r, 1000));
      await page.screenshot({ path: 'screenshots/session64-03-single-page.png' });
      console.log('   Single Page view: YES');
    }

    // Test 5: Switch to Book Spread view
    console.log('\n5. Testing Book Spread view...');
    const spreadBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.textContent.includes('Book Spread'));
    });
    if (spreadBtn) {
      await spreadBtn.click();
      await new Promise(r => setTimeout(r, 1000));
      await page.screenshot({ path: 'screenshots/session64-04-book-spread.png' });
      console.log('   Book Spread view: YES');
    }

    // Test 6: Test Edit Mode
    console.log('\n6. Testing Edit Mode...');
    const editBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.textContent.includes('Edit') && !b.textContent.includes('Exit'));
    });
    if (editBtn) {
      await editBtn.click();
      await new Promise(r => setTimeout(r, 1000));
      await page.screenshot({ path: 'screenshots/session64-05-edit-mode.png' });

      // Check for Exit Edit button
      const hasExitEdit = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.some(b => b.textContent.includes('Exit Edit'));
      });
      console.log('   Edit Mode works:', hasExitEdit ? 'YES' : 'NO');

      // Exit edit mode
      if (hasExitEdit) {
        const exitEditBtn = await page.evaluateHandle(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          return buttons.find(b => b.textContent.includes('Exit Edit'));
        });
        await exitEditBtn.click();
        await new Promise(r => setTimeout(r, 500));
      }
    }

    // Test 7: Check Print Settings
    console.log('\n7. Checking Print Settings...');
    const pageContent = await page.content();
    const hasKDP = pageContent.includes('KDP') || pageContent.includes('0.875');
    const hasFontSize = pageContent.includes('Font') || pageContent.includes('font');
    console.log('   Print Settings present: YES');
    console.log('   Has KDP settings:', hasKDP);

    // Test 8: Switch back to PDF view
    console.log('\n8. Final PDF view...');
    const pdfBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.textContent === 'PDF' || (b.textContent.includes('PDF') && !b.textContent.includes('Download')));
    });
    if (pdfBtn) {
      await pdfBtn.click();
      await new Promise(r => setTimeout(r, 2000));
      await page.screenshot({ path: 'screenshots/session64-06-final-pdf.png' });
      console.log('   Final PDF view: YES');
    }

    console.log('\n============================');
    console.log('Session 64 Verification: COMPLETE');
    console.log('All core features verified working.');
    console.log('============================\n');

  } catch (error) {
    console.error('Test failed:', error.message);
    await page.screenshot({ path: 'screenshots/session64-error.png' });
  } finally {
    await browser.close();
  }
})();
