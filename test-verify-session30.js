const puppeteer = require('puppeteer');

async function test() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('Navigating to application...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });

  // Take initial screenshot
  await page.screenshot({ path: 'screenshots/session30-01-initial.png', fullPage: true });
  console.log('1. Saved initial screenshot');

  // Click Genesis (DE) sample data button
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.textContent.includes('Genesis') && btn.textContent.includes('DE')) {
        btn.click();
        break;
      }
    }
  });
  console.log('2. Clicked Genesis (DE) button');

  // Wait for content to load
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'screenshots/session30-02-sample-loaded.png', fullPage: true });
  console.log('3. Saved sample loaded screenshot');

  // Check for various elements that should be present
  const checks = await page.evaluate(() => {
    const results = {
      hasContent: !document.body.innerText.includes('No content yet'),
      hasTitlePage: document.body.innerText.includes('GENESIS') || document.body.innerText.includes('Genesis'),
      hasVerseNumbers: document.querySelectorAll('[class*="verse"]').length,
      hasInterlinear: document.querySelectorAll('ruby, [class*="interlinear"]').length,
      hasEditModeButton: document.body.innerText.includes('Edit Mode'),
      hasViewModeOptions: document.body.innerText.includes('Book Spread') && document.body.innerText.includes('Single Page'),
      settingsPanel: document.body.innerText.includes('Page Size') && document.body.innerText.includes('Margins'),
      pdfExport: document.body.innerText.includes('Print / PDF'),
      pageCount: document.querySelectorAll('[class*="page"]').length
    };
    return results;
  });

  console.log('\n=== Feature Verification ===');
  console.log('- Content loaded:', checks.hasContent);
  console.log('- Title/Genesis text:', checks.hasTitlePage);
  console.log('- Verse elements:', checks.hasVerseNumbers);
  console.log('- Interlinear elements:', checks.hasInterlinear);
  console.log('- Edit mode button:', checks.hasEditModeButton);
  console.log('- View mode options:', checks.hasViewModeOptions);
  console.log('- Settings panel:', checks.settingsPanel);
  console.log('- PDF export option:', checks.pdfExport);
  console.log('- Page elements:', checks.pageCount);

  // Test Single Page view
  console.log('\n4. Testing Single Page view...');
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.textContent.includes('Single Page')) {
        btn.click();
        break;
      }
    }
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'screenshots/session30-03-single-page.png', fullPage: true });
  console.log('5. Saved Single Page view screenshot');

  // Test Edit Mode
  console.log('6. Testing Edit Mode...');
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.textContent.includes('Edit Mode')) {
        btn.click();
        break;
      }
    }
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'screenshots/session30-04-edit-mode.png', fullPage: true });
  console.log('7. Saved Edit Mode screenshot');

  // Turn off edit mode
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.textContent.includes('Edit Mode')) {
        btn.click();
        break;
      }
    }
  });

  // Test PDF view
  console.log('8. Testing PDF view...');
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.textContent === 'PDF') {
        btn.click();
        break;
      }
    }
  });
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: 'screenshots/session30-05-pdf-view.png', fullPage: true });
  console.log('9. Saved PDF view screenshot');

  // Check if PDF is rendered
  const pdfCheck = await page.evaluate(() => {
    const iframe = document.querySelector('iframe');
    const canvas = document.querySelectorAll('canvas');
    return {
      hasIframe: !!iframe,
      canvasCount: canvas.length
    };
  });
  console.log('- PDF iframe:', pdfCheck.hasIframe);
  console.log('- Canvas elements (PDF):', pdfCheck.canvasCount);

  // Test Book Spread view
  console.log('10. Testing Book Spread view...');
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.textContent.includes('Book Spread')) {
        btn.click();
        break;
      }
    }
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'screenshots/session30-06-book-spread.png', fullPage: true });
  console.log('11. Saved Book Spread view screenshot');

  // Verify justification on content
  console.log('\n12. Checking text justification...');
  const justificationCheck = await page.evaluate(() => {
    const contentArea = document.querySelector('[style*="justify"]') ||
                        document.querySelector('.text-justify') ||
                        document.querySelector('[class*="content"]');
    return {
      hasJustifiedStyle: !!document.querySelector('[style*="justify"]'),
      hasJustifyClass: !!document.querySelector('.text-justify, [class*="justify"]')
    };
  });
  console.log('- Text justify style:', justificationCheck.hasJustifiedStyle || justificationCheck.hasJustifyClass);

  await browser.close();
  console.log('\n=== Verification Test Completed Successfully ===');
}

test().catch(err => {
  console.error('Test failed:', err.message);
  process.exit(1);
});
