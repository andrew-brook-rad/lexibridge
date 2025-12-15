const puppeteer = require('puppeteer');

const sampleText = `1 Am Anfang schuf Gott Himmel und Erde.`;

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

  console.log('2. Entering sample text...');
  await page.type('textarea', sampleText);

  console.log('3. Clicking Translate button...');
  const translateButton = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(btn => btn.textContent.includes('Translate'));
  });
  await translateButton.click();

  // Wait for translation to complete
  console.log('4. Waiting for translation (up to 60 seconds)...');
  try {
    await page.waitForSelector('ruby, .word-unit', { timeout: 60000 });
    console.log('   Translation completed!');
  } catch (e) {
    console.log('   Timeout waiting for translation');
  }
  await new Promise(r => setTimeout(r, 2000));

  // Take screenshot before edit mode
  await page.screenshot({ path: 'screenshots/edit-01-before-editmode.png', fullPage: true });

  // Click Edit Mode button
  console.log('5. Clicking Edit Mode button...');
  const editModeButton = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(btn => btn.textContent.includes('Edit Mode'));
  });
  await editModeButton.click();
  await new Promise(r => setTimeout(r, 500));

  // Take screenshot in edit mode
  await page.screenshot({ path: 'screenshots/edit-02-editmode-active.png', fullPage: true });

  // Check if edit mode styling is applied
  const hasEditMode = await page.$('.edit-mode') !== null;
  console.log('   Edit mode container found:', hasEditMode);

  // Click on a word to edit
  console.log('6. Clicking on a word to open edit dialog...');
  const wordUnits = await page.$$('.word-unit');
  console.log('   Found word units:', wordUnits.length);

  if (wordUnits.length > 2) {
    await wordUnits[2].click(); // Click on third word (e.g., "schuf")
    await new Promise(r => setTimeout(r, 1000));
  }

  // Take screenshot with edit dialog open
  await page.screenshot({ path: 'screenshots/edit-03-dialog-open.png', fullPage: true });

  // Check if edit dialog is visible
  const dialogExists = await page.$('input[placeholder="GLOSS"]') !== null;
  console.log('   Edit dialog visible:', dialogExists);

  if (dialogExists) {
    // Modify the gloss
    console.log('7. Modifying gloss...');
    const glossInputs = await page.$$('input');
    // Find the gloss input (second input in the dialog)
    const glossInput = await page.evaluateHandle(() => {
      const inputs = Array.from(document.querySelectorAll('.fixed input'));
      return inputs.find(input => input.placeholder === 'GLOSS' || input.className.includes('uppercase'));
    });

    if (glossInput) {
      await glossInput.click({ clickCount: 3 }); // Select all
      await page.keyboard.type('CREATED-TEST');
    }

    // Take screenshot with modified gloss
    await page.screenshot({ path: 'screenshots/edit-04-gloss-modified.png', fullPage: true });

    // Click Save button
    console.log('8. Saving changes...');
    const saveButton = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(btn => btn.textContent.includes('Save'));
    });
    if (saveButton) {
      await saveButton.click();
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  // Take screenshot after saving
  await page.screenshot({ path: 'screenshots/edit-05-after-save.png', fullPage: true });

  // Check if the gloss was updated in the preview
  const glosses = await page.$$eval('rt', els => els.map(el => el.textContent));
  console.log('   Current glosses:', glosses.slice(0, 8));

  // Exit edit mode
  console.log('9. Exiting edit mode...');
  const exitEditButton = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(btn => btn.textContent.includes('Exit Edit'));
  });
  if (exitEditButton) {
    await exitEditButton.click();
    await new Promise(r => setTimeout(r, 500));
  }

  await page.screenshot({ path: 'screenshots/edit-06-final.png', fullPage: true });

  // Check persistence - refresh and verify
  console.log('10. Testing persistence...');
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({ path: 'screenshots/edit-07-after-refresh.png', fullPage: true });

  const glossesAfterRefresh = await page.$$eval('rt', els => els.map(el => el.textContent)).catch(() => []);
  console.log('   Glosses after refresh:', glossesAfterRefresh.slice(0, 8));

  await browser.close();
  console.log('Done! Edit mode test complete.');
})();
