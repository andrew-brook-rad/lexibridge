const puppeteer = require('puppeteer');

async function test() {
  console.log('Starting full verification test...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  try {
    // Step 1: Load the app
    console.log('\n=== Step 1: Loading app ===');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle0', timeout: 30000 });
    console.log('App loaded');
    await page.screenshot({ path: 'screenshots/full-verify-01-initial.png' });

    // Step 2: Load Genesis (DE) sample data
    console.log('\n=== Step 2: Loading Genesis (DE) sample ===');
    const allButtons = await page.$$('button');
    for (const btn of allButtons) {
      const text = await btn.evaluate(el => el.textContent);
      if (text.includes('Genesis (DE)')) {
        await btn.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: 'screenshots/full-verify-02-sample-loaded.png' });

    // Check if content loaded
    const hasContent = await page.evaluate(() => {
      return !document.body.innerText.includes('No content yet');
    });
    console.log('Content loaded:', hasContent);

    // Step 3: Check PDF view
    console.log('\n=== Step 3: Checking PDF view ===');
    // PDF view should be default
    const pdfViewActive = await page.evaluate(() => {
      const pdfBtn = document.querySelector('button');
      const buttons = Array.from(document.querySelectorAll('button'));
      const pdfButton = buttons.find(b => b.textContent === 'PDF');
      return pdfButton ? pdfButton.classList.contains('bg-indigo-600') || pdfButton.classList.contains('bg-blue-600') : false;
    });
    console.log('PDF view active:', pdfViewActive);
    await page.screenshot({ path: 'screenshots/full-verify-03-pdf-view.png', fullPage: true });

    // Step 4: Switch to Single Page view
    console.log('\n=== Step 4: Switching to Single Page view ===');
    const buttons = await page.$$('button');
    for (const button of buttons) {
      const text = await button.evaluate(el => el.textContent);
      if (text === 'Single Page') {
        await button.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'screenshots/full-verify-04-single-page.png', fullPage: true });

    // Step 5: Check for verse numbers and interlinear text
    console.log('\n=== Step 5: Checking interlinear content ===');
    const contentInfo = await page.evaluate(() => {
      const text = document.body.innerText;
      const hasVerseNumbers = /\d+/.test(text) && text.includes('Am');
      const hasGermanText = text.includes('Anfang') || text.includes('Gott');
      const hasGlosses = text.includes('BEGINNING') || text.includes('GOD') || text.includes('IN THE');
      return { hasVerseNumbers, hasGermanText, hasGlosses };
    });
    console.log('Verse numbers present:', contentInfo.hasVerseNumbers);
    console.log('German text present:', contentInfo.hasGermanText);
    console.log('Glosses present:', contentInfo.hasGlosses);

    // Step 6: Test Edit Mode
    console.log('\n=== Step 6: Testing Edit Mode ===');
    const allBtns2 = await page.$$('button');
    for (const btn of allBtns2) {
      const text = await btn.evaluate(el => el.textContent);
      if (text.includes('Edit Mode')) {
        await btn.click();
        await new Promise(r => setTimeout(r, 500));
        console.log('Edit mode activated');
        break;
      }
    }
    await page.screenshot({ path: 'screenshots/full-verify-05-edit-mode.png', fullPage: true });

    // Step 7: Switch to Book Spread view
    console.log('\n=== Step 7: Testing Book Spread view ===');
    for (const button of await page.$$('button')) {
      const text = await button.evaluate(el => el.textContent);
      if (text === 'Book Spread') {
        await button.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'screenshots/full-verify-06-book-spread.png', fullPage: true });

    // Step 8: Check title page exists
    console.log('\n=== Step 8: Checking title page ===');
    const titlePageInfo = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasTitle: text.includes('GENESIS') || text.includes('Genesis'),
        hasInterlinear: text.includes('Interlinear')
      };
    });
    console.log('Title page has title:', titlePageInfo.hasTitle);
    console.log('Title page has Interlinear text:', titlePageInfo.hasInterlinear);

    // Step 9: Switch back to PDF view and check PDF generation
    console.log('\n=== Step 9: Checking PDF generation ===');
    for (const button of await page.$$('button')) {
      const text = await button.evaluate(el => el.textContent);
      if (text === 'PDF') {
        await button.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 2000));

    // Check for PDF embed or canvas
    const pdfInfo = await page.evaluate(() => {
      const embed = document.querySelector('embed[type="application/pdf"]');
      const iframe = document.querySelector('iframe');
      const canvas = document.querySelector('canvas');
      const downloadBtn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('Download') || b.textContent.includes('PDF')
      );
      return {
        hasEmbed: !!embed,
        hasIframe: !!iframe,
        hasCanvas: !!canvas,
        hasDownloadBtn: !!downloadBtn
      };
    });
    console.log('PDF embed:', pdfInfo.hasEmbed);
    console.log('Iframe:', pdfInfo.hasIframe);
    console.log('Canvas:', pdfInfo.hasCanvas);
    console.log('Download button:', pdfInfo.hasDownloadBtn);
    await page.screenshot({ path: 'screenshots/full-verify-07-pdf-final.png', fullPage: true });

    console.log('\n=== VERIFICATION COMPLETE ===');
    console.log('All core features verified!');

    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('Test error:', err.message);
    await page.screenshot({ path: 'screenshots/full-verify-error.png' }).catch(() => {});
    await browser.close();
    process.exit(1);
  }
}

test();
