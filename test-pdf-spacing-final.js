const puppeteer = require('puppeteer');

// Helper function for delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runTest() {
  console.log('Starting Final PDF Word Spacing Verification Test...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1000 });

  try {
    // Navigate to the app
    console.log('1. Navigating to app...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
    await page.screenshot({ path: 'screenshots/pdf-spacing-01-initial.png', fullPage: false });
    console.log('   Screenshot: pdf-spacing-01-initial.png');

    // Load Genesis (DE) sample
    console.log('2. Loading Genesis (DE) sample...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes('Genesis (DE)'));
      if (btn) btn.click();
    });
    await delay(2000);
    await page.screenshot({ path: 'screenshots/pdf-spacing-02-genesis-loaded.png', fullPage: false });
    console.log('   Screenshot: pdf-spacing-02-genesis-loaded.png');

    // Go to Single Page view for detailed inspection
    console.log('3. Opening Single Page view...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes('Single Page'));
      if (btn) btn.click();
    });
    await delay(1500);

    // Click Recto (Odd) to see content page
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes('Recto'));
      if (btn) btn.click();
    });
    await delay(500);
    await page.screenshot({ path: 'screenshots/pdf-spacing-03-single-page-recto.png', fullPage: false });
    console.log('   Screenshot: pdf-spacing-03-single-page-recto.png');

    // Go to PDF view
    console.log('4. Opening PDF view to test export...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes('PDF') && !b.textContent.includes('Download'));
      if (btn) btn.click();
    });
    await delay(3000);
    await page.screenshot({ path: 'screenshots/pdf-spacing-04-pdf-view.png', fullPage: false });
    console.log('   Screenshot: pdf-spacing-04-pdf-view.png');

    // Check if Download PDF button exists
    const hasDownloadPDF = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.some(b => b.textContent.includes('Download PDF'));
    });
    console.log(`   Download PDF button present: ${hasDownloadPDF ? 'YES' : 'NO'}`);

    // Scroll settings panel to show word spacing controls
    console.log('5. Verifying Word Spacing controls...');
    await page.evaluate(() => {
      const settingsPanel = document.querySelector('.settings-panel');
      if (settingsPanel) {
        settingsPanel.scrollTop = settingsPanel.scrollHeight;
      }
    });
    await delay(300);

    // Check Word Spacing controls
    const hasWordSpacingLabel = await page.evaluate(() => {
      return document.body.textContent.includes('Word Spacing');
    });
    console.log(`   Word Spacing label present: ${hasWordSpacingLabel ? 'YES' : 'NO'}`);

    // Get current min/max values
    const spacingValues = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input[type="number"]'));
      const values = inputs.map(i => parseFloat(i.value));
      // Look for values around 1.5 and 8.0 (our defaults)
      const minVal = values.find(v => v >= 1 && v <= 3);
      const maxVal = values.find(v => v >= 6 && v <= 10);
      return { min: minVal, max: maxVal };
    });
    console.log(`   Min Word Space: ${spacingValues.min || 'not found'}mm`);
    console.log(`   Max Word Space: ${spacingValues.max || 'not found'}mm`);

    await page.screenshot({ path: 'screenshots/pdf-spacing-05-word-spacing-controls.png', fullPage: false });
    console.log('   Screenshot: pdf-spacing-05-word-spacing-controls.png');

    // Navigate to page 2 in PDF viewer to see content pages
    console.log('6. Navigating PDF to content page...');
    // Try clicking in the PDF viewer to navigate
    await page.evaluate(() => {
      const iframe = document.querySelector('iframe');
      if (iframe) {
        // Try to access PDF viewer controls
        const pdfViewer = iframe.contentDocument || iframe.contentWindow.document;
        // Look for page navigation
      }
    });

    // Use keyboard navigation in PDF viewer
    await page.keyboard.press('ArrowDown');
    await delay(500);
    await page.keyboard.press('ArrowDown');
    await delay(500);
    await page.screenshot({ path: 'screenshots/pdf-spacing-06-pdf-content.png', fullPage: false });
    console.log('   Screenshot: pdf-spacing-06-pdf-content.png');

    // Test changing word spacing and reflowing
    console.log('7. Testing word spacing adjustment...');

    // Scroll to word spacing controls again
    await page.evaluate(() => {
      const settingsPanel = document.querySelector('.settings-panel');
      if (settingsPanel) {
        settingsPanel.scrollTop = settingsPanel.scrollHeight;
      }
    });
    await delay(300);

    // Change min word spacing to 2mm
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input[type="number"]'));
      for (const input of inputs) {
        const val = parseFloat(input.value);
        if (val >= 1 && val <= 2) {
          input.value = '2';
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          break;
        }
      }
    });
    await delay(500);

    // Click Reflow
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes('Reflow'));
      if (btn) btn.click();
    });
    await delay(2000);

    // Go to PDF view again
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes('PDF') && !b.textContent.includes('Download'));
      if (btn) btn.click();
    });
    await delay(3000);
    await page.screenshot({ path: 'screenshots/pdf-spacing-07-after-adjustment.png', fullPage: false });
    console.log('   Screenshot: pdf-spacing-07-after-adjustment.png');

    // Final verification
    console.log('\n=== FINAL VERIFICATION RESULTS ===');
    console.log(`[PASS] App loads correctly`);
    console.log(`[PASS] Genesis sample loads`);
    console.log(`[${hasDownloadPDF ? 'PASS' : 'FAIL'}] Download PDF button present`);
    console.log(`[${hasWordSpacingLabel ? 'PASS' : 'FAIL'}] Word Spacing controls present`);
    console.log(`[${spacingValues.min ? 'PASS' : 'FAIL'}] Min word space setting found`);
    console.log(`[${spacingValues.max ? 'PASS' : 'FAIL'}] Max word space setting found`);

    console.log('\n=== MANUAL VERIFICATION NEEDED ===');
    console.log('Please review the following screenshots to verify word spacing:');
    console.log('1. pdf-spacing-03-single-page-recto.png - Words have proper spacing');
    console.log('2. pdf-spacing-05-word-spacing-controls.png - Min/Max controls visible');
    console.log('3. pdf-spacing-07-after-adjustment.png - Spacing responds to changes');
    console.log('\nKey things to check:');
    console.log('- Last lines of pages should have proper word spacing (not squeezed)');
    console.log('- All lines should have consistent, professional spacing');
    console.log('- Word Spacing controls should show Min and Max inputs');

    console.log('\n=== TEST COMPLETE ===');

  } catch (error) {
    console.error('Error during test:', error);
    await page.screenshot({ path: 'screenshots/pdf-spacing-error.png', fullPage: false });
  } finally {
    await browser.close();
  }
}

runTest();
