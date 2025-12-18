const puppeteer = require('puppeteer');

// Helper function for delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runTest() {
  console.log('Starting Detailed Word Spacing Verification Test...');

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

    // Load Genesis (DE) sample
    console.log('2. Loading Genesis (DE) sample...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes('Genesis (DE)'));
      if (btn) btn.click();
    });
    await delay(2000);

    // Scroll down in the settings panel to show Word Spacing controls
    console.log('3. Scrolling to show Word Spacing settings...');
    await page.evaluate(() => {
      // Find the settings panel and scroll it
      const settingsPanel = document.querySelector('.settings-panel');
      if (settingsPanel) {
        settingsPanel.scrollTop = settingsPanel.scrollHeight;
      }
    });
    await delay(500);
    await page.screenshot({ path: 'screenshots/word-spacing-detailed-01-settings-scrolled.png', fullPage: false });
    console.log('   Screenshot: word-spacing-detailed-01-settings-scrolled.png');

    // Verify Word Spacing is visible
    const hasWordSpacing = await page.evaluate(() => {
      return document.body.textContent.includes('Word Spacing');
    });
    console.log(`   Word Spacing controls visible: ${hasWordSpacing ? 'YES' : 'NO'}`);

    // Go to PDF view and navigate to page 2 to see content
    console.log('4. Opening PDF view...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes('PDF') && !b.textContent.includes('Download'));
      if (btn) btn.click();
    });
    await delay(3000);

    // Navigate to page 2 in PDF viewer (where content is)
    console.log('5. Navigating to page 2 in PDF...');
    // Click next page button in PDF viewer
    await page.evaluate(() => {
      // Try clicking the next page button in the PDF viewer
      const nextBtn = document.querySelector('[data-testid="next-page"]') ||
                      document.querySelector('button[title="Next page"]') ||
                      document.querySelector('.pdf-controls button:nth-child(2)');
      if (nextBtn) nextBtn.click();
    });
    await delay(1000);

    // Or try using keyboard
    await page.keyboard.press('ArrowRight');
    await delay(1000);

    await page.screenshot({ path: 'screenshots/word-spacing-detailed-02-pdf-page2.png', fullPage: false });
    console.log('   Screenshot: word-spacing-detailed-02-pdf-page2.png');

    // Go to Single Page view for better detail
    console.log('6. Checking Single Page view for word spacing...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes('Single Page'));
      if (btn) btn.click();
    });
    await delay(1500);
    await page.screenshot({ path: 'screenshots/word-spacing-detailed-03-single-page.png', fullPage: false });
    console.log('   Screenshot: word-spacing-detailed-03-single-page.png');

    // Go to Book Spread view
    console.log('7. Checking Book Spread view...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes('Book Spread'));
      if (btn) btn.click();
    });
    await delay(1500);
    await page.screenshot({ path: 'screenshots/word-spacing-detailed-04-book-spread.png', fullPage: false });
    console.log('   Screenshot: word-spacing-detailed-04-book-spread.png');

    // Test changing the word spacing values
    console.log('8. Testing word spacing adjustments...');

    // Scroll settings panel down again
    await page.evaluate(() => {
      const settingsPanel = document.querySelector('.settings-panel');
      if (settingsPanel) {
        settingsPanel.scrollTop = settingsPanel.scrollHeight;
      }
    });
    await delay(300);

    // Change min word spacing to 2.5mm
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input[type="number"]'));
      // Find inputs with value around 1.5 (min word space)
      for (const input of inputs) {
        if (parseFloat(input.value) === 1.5) {
          input.value = '2.5';
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          break;
        }
      }
    });
    await delay(500);

    // Click Reflow button
    console.log('9. Clicking Reflow button...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes('Reflow'));
      if (btn) btn.click();
    });
    await delay(2000);

    // Go back to PDF view
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes('PDF') && !b.textContent.includes('Download'));
      if (btn) btn.click();
    });
    await delay(3000);
    await page.screenshot({ path: 'screenshots/word-spacing-detailed-05-after-adjustment.png', fullPage: false });
    console.log('   Screenshot: word-spacing-detailed-05-after-adjustment.png');

    console.log('\n=== TEST COMPLETE ===');
    console.log('Review the screenshots to verify:');
    console.log('1. word-spacing-detailed-01-settings-scrolled.png - Word Spacing controls visible');
    console.log('2. word-spacing-detailed-03-single-page.png - Words have proper spacing on all lines');
    console.log('3. word-spacing-detailed-04-book-spread.png - Book spread shows proper spacing');
    console.log('4. word-spacing-detailed-05-after-adjustment.png - Spacing responds to setting changes');

  } catch (error) {
    console.error('Error during test:', error);
    await page.screenshot({ path: 'screenshots/word-spacing-detailed-error.png', fullPage: false });
  } finally {
    await browser.close();
  }
}

runTest();
