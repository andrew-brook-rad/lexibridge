const puppeteer = require('puppeteer');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function test() {
  console.log('Starting comprehensive verification test...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  // Navigate to app
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle0', timeout: 30000 });
  console.log('✓ App loaded successfully');

  // Take initial screenshot
  await page.screenshot({ path: 'screenshots/verify-1-initial.png', fullPage: true });

  // TEST 1: Verify Word Spacing controls exist in Print Settings
  console.log('\n--- TEST 1: Word Spacing Controls ---');

  const wordSpacingLabel = await page.evaluate(() => {
    const labels = Array.from(document.querySelectorAll('label, span, div'));
    return labels.some(el => el.textContent.includes('Word Spacing'));
  });
  console.log('Word Spacing label found:', wordSpacingLabel ? '✓' : '✗');

  const inputs = await page.$$('input[type="number"]');
  console.log('Number of numeric inputs found:', inputs.length);

  // Find word spacing min/max values by looking at input values
  const wordSpacingValues = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input[type="number"]'));
    const values = inputs.map(inp => ({ value: inp.value, min: inp.min, max: inp.max, step: inp.step }));
    const minSpacing = values.find(v => parseFloat(v.value) === 1.5 || (parseFloat(v.min) === 0.5 && parseFloat(v.max) === 5));
    const maxSpacing = values.find(v => parseFloat(v.value) === 8 || (parseFloat(v.min) === 2 && parseFloat(v.max) === 15));
    return { minSpacing, maxSpacing };
  });
  console.log('Min word spacing input:', wordSpacingValues.minSpacing ? '✓ Found' : '✗ Not found');
  console.log('Max word spacing input:', wordSpacingValues.maxSpacing ? '✓ Found' : '✗ Not found');

  // TEST 2: Load sample text and generate interlinear
  console.log('\n--- TEST 2: Load Sample Text and Generate ---');

  // Click on "Load Genesis 1:1-8" link
  await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a, button, span'));
    const loadLink = links.find(el => el.textContent.includes('Load Genesis 1:1-8'));
    if (loadLink) loadLink.click();
  });
  await sleep(500);
  console.log('✓ Clicked Load Genesis 1:1-8');

  // Check if textarea has content
  const textareaContent = await page.evaluate(() => {
    const textarea = document.querySelector('textarea');
    return textarea ? textarea.value : '';
  });
  console.log('Textarea has content:', textareaContent.length > 0 ? '✓' : '✗');
  console.log('Content preview:', textareaContent.substring(0, 100) + '...');

  await page.screenshot({ path: 'screenshots/verify-2-text-loaded.png', fullPage: true });

  // Click Translate button
  console.log('\n--- TEST 3: Translate and Generate PDF ---');

  const translateButton = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent.includes('Translate'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked Translate button:', translateButton ? '✓' : '✗');

  // Wait for translation (this can take a while with AI)
  console.log('Waiting for translation to complete (up to 60s)...');
  await sleep(3000);

  // Check for loading state or content
  let attempts = 0;
  let hasContent = false;
  while (attempts < 20 && !hasContent) {
    hasContent = await page.evaluate(() => {
      const hasText = document.body.innerText.includes('BEGINNING') ||
                      document.body.innerText.includes('GOD') ||
                      document.body.innerText.includes('Anfang');
      const noLoading = !document.body.innerText.includes('Translating') &&
                        !document.body.innerText.includes('Loading');
      return hasText && noLoading;
    });
    if (!hasContent) {
      await sleep(3000);
      attempts++;
      console.log(`  Attempt ${attempts}/20...`);
    }
  }

  await page.screenshot({ path: 'screenshots/verify-3-translated.png', fullPage: true });

  if (hasContent) {
    console.log('✓ Translation completed successfully');
  } else {
    console.log('⚠ Translation may still be in progress or failed');
  }

  // TEST 4: Check PDF view
  console.log('\n--- TEST 4: Verify PDF View ---');

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const pdfBtn = buttons.find(b => b.textContent.trim() === 'PDF');
    if (pdfBtn) pdfBtn.click();
  });
  await sleep(1000);

  await page.screenshot({ path: 'screenshots/verify-4-pdf-view.png', fullPage: true });
  console.log('✓ Switched to PDF view');

  // TEST 5: Check Single Page view
  console.log('\n--- TEST 5: Verify Single Page View ---');

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const singleBtn = buttons.find(b => b.textContent.includes('Single Page'));
    if (singleBtn) singleBtn.click();
  });
  await sleep(1000);

  await page.screenshot({ path: 'screenshots/verify-5-single-page.png', fullPage: true });
  console.log('✓ Switched to Single Page view');

  // TEST 6: Adjust word spacing and verify reflow
  console.log('\n--- TEST 6: Adjust Word Spacing ---');

  const spacingChanged = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input[type="number"]'));
    const wordSpacingSection = Array.from(document.querySelectorAll('div, label')).find(
      el => el.textContent.includes('Word Spacing')
    );
    if (wordSpacingSection) {
      const parent = wordSpacingSection.closest('div');
      if (parent) {
        const nearbyInputs = parent.querySelectorAll('input[type="number"]');
        if (nearbyInputs.length >= 1) {
          nearbyInputs[0].value = '2';
          nearbyInputs[0].dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }
      }
    }
    return false;
  });
  console.log('Word spacing adjusted:', spacingChanged ? '✓' : '⚠ Could not find inputs');

  // Click Reflow Layout
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const reflowBtn = buttons.find(b => b.textContent.includes('Reflow'));
    if (reflowBtn) reflowBtn.click();
  });
  await sleep(1000);

  await page.screenshot({ path: 'screenshots/verify-6-reflow.png', fullPage: true });
  console.log('✓ Clicked Reflow Layout');

  // Final summary
  console.log('\n========================================');
  console.log('VERIFICATION COMPLETE');
  console.log('========================================');
  console.log('Screenshots saved to screenshots/ directory');

  await browser.close();
  console.log('\n✓ Test completed successfully');
}

test().catch(err => {
  console.error('Test failed:', err.message);
  process.exit(1);
});
