const puppeteer = require('puppeteer');

// Helper function for delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runTest() {
  console.log('Starting Word Spacing Fix Verification Test...');

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
    await page.screenshot({ path: 'screenshots/word-spacing-01-initial.png', fullPage: false });
    console.log('   Screenshot: word-spacing-01-initial.png');

    // Check app loaded
    const appLoaded = await page.evaluate(() => {
      return document.body.textContent.includes('LexiBridge');
    });
    console.log(`   App loaded: ${appLoaded ? 'YES' : 'NO'}`);

    // Load Genesis (DE) sample
    console.log('2. Loading Genesis (DE) sample...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes('Genesis (DE)'));
      if (btn) btn.click();
    });
    await delay(2000);
    await page.screenshot({ path: 'screenshots/word-spacing-02-genesis-loaded.png', fullPage: false });
    console.log('   Screenshot: word-spacing-02-genesis-loaded.png');

    // Go to PDF view
    console.log('3. Opening PDF view...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes('PDF') && !b.textContent.includes('Download'));
      if (btn) btn.click();
    });
    await delay(3000);
    await page.screenshot({ path: 'screenshots/word-spacing-03-pdf-view.png', fullPage: false });
    console.log('   Screenshot: word-spacing-03-pdf-view.png');

    // Check for Word Spacing settings in Print Settings panel
    console.log('4. Checking for Word Spacing settings...');
    const hasWordSpacing = await page.evaluate(() => {
      return document.body.textContent.includes('Word Spacing');
    });
    console.log(`   Word Spacing controls present: ${hasWordSpacing ? 'YES' : 'NO'}`);

    if (hasWordSpacing) {
      await page.screenshot({ path: 'screenshots/word-spacing-04-settings.png', fullPage: false });
      console.log('   Screenshot: word-spacing-04-settings.png');
    }

    // Check for Min/Max inputs
    const hasMinMax = await page.evaluate(() => {
      const labels = document.body.textContent;
      return labels.includes('Min') && labels.includes('Max');
    });
    console.log(`   Min/Max controls present: ${hasMinMax ? 'YES' : 'NO'}`);

    // Try to adjust word spacing settings
    console.log('5. Testing word spacing adjustments...');
    await page.evaluate(() => {
      // Find inputs with min word spacing
      const inputs = Array.from(document.querySelectorAll('input[type="number"]'));
      // Get the input that has value 1.5 (default minWordSpace)
      const minSpaceInput = inputs.find(i => i.value === '1.5');
      if (minSpaceInput) {
        minSpaceInput.value = '2.0';
        minSpaceInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await delay(500);

    // Click Reflow button
    console.log('6. Clicking Reflow button...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes('Reflow'));
      if (btn) btn.click();
    });
    await delay(2000);
    await page.screenshot({ path: 'screenshots/word-spacing-05-after-reflow.png', fullPage: false });
    console.log('   Screenshot: word-spacing-05-after-reflow.png');

    // Go back to PDF view to see the changes
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes('PDF') && !b.textContent.includes('Download'));
      if (btn) btn.click();
    });
    await delay(3000);
    await page.screenshot({ path: 'screenshots/word-spacing-06-final-pdf.png', fullPage: false });
    console.log('   Screenshot: word-spacing-06-final-pdf.png');

    console.log('\n=== VERIFICATION RESULTS ===');
    console.log(`Word Spacing controls added: ${hasWordSpacing ? 'PASS' : 'FAIL'}`);
    console.log(`Min/Max controls present: ${hasMinMax ? 'PASS' : 'FAIL'}`);
    console.log('');
    console.log('Please review the screenshots to verify:');
    console.log('1. Words on last lines have proper spacing (not squeezed together)');
    console.log('2. Word spacing controls are visible in Print Settings');
    console.log('3. PDF renders correctly with proper word spacing');
    console.log('\n=== TEST COMPLETE ===');

  } catch (error) {
    console.error('Error during test:', error);
    await page.screenshot({ path: 'screenshots/word-spacing-error.png', fullPage: false });
  } finally {
    await browser.close();
  }
}

runTest();
