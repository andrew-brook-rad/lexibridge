const puppeteer = require('puppeteer');

const sampleText = `1 Am Anfang schuf Gott.`;

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('1. Navigating to http://localhost:3001...');
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle0' });

  // Clear localStorage and reload
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });

  console.log('2. Entering sample text and translating...');
  await page.type('textarea', sampleText);

  const translateButton = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(btn => btn.textContent.includes('Translate'));
  });
  await translateButton.click();

  // Wait for translation
  await page.waitForSelector('ruby, .word-unit', { timeout: 60000 });
  await new Promise(r => setTimeout(r, 2000));

  // Get glosses before edit
  const glossesBefore = await page.$$eval('rt', els => els.map(el => el.textContent));
  console.log('   Glosses before edit:', glossesBefore);

  // Enable edit mode and edit a word
  console.log('3. Editing a gloss...');
  const editModeButton = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(btn => btn.textContent.includes('Edit Mode'));
  });
  await editModeButton.click();
  await new Promise(r => setTimeout(r, 500));

  // Click on the first word
  const wordUnits = await page.$$('.word-unit');
  if (wordUnits.length > 0) {
    await wordUnits[0].click();
    await new Promise(r => setTimeout(r, 1000));
  }

  // Find and modify the gloss input
  const glossInput = await page.evaluateHandle(() => {
    const inputs = Array.from(document.querySelectorAll('.fixed input'));
    return inputs[1]; // Second input is the gloss
  });

  if (glossInput) {
    await glossInput.click({ clickCount: 3 });
    await page.keyboard.type('AT-MODIFIED');

    // Save changes
    const saveButton = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(btn => btn.textContent.includes('Save'));
    });
    await saveButton.click();
    await new Promise(r => setTimeout(r, 1000));
  }

  // Get glosses after edit
  const glossesAfterEdit = await page.$$eval('rt', els => els.map(el => el.textContent));
  console.log('   Glosses after edit:', glossesAfterEdit);

  // Refresh page
  console.log('4. Refreshing page...');
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  // Check glosses after refresh
  const glossesAfterRefresh = await page.$$eval('rt', els => els.map(el => el.textContent));
  console.log('   Glosses after refresh:', glossesAfterRefresh);

  // Take screenshot
  await page.screenshot({ path: 'screenshots/persistence-test.png', fullPage: true });

  // Check if edit persisted
  const editPersisted = glossesAfterRefresh.length > 0 && glossesAfterRefresh.some(g => g.includes('MODIFIED'));
  console.log('5. Edit persisted:', editPersisted);

  await browser.close();
  console.log('Done! Persistence test complete.');
})();
