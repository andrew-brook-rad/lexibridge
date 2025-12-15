const puppeteer = require('puppeteer');

const sampleText = `1 Am Anfang schuf Gott Himmel und Erde.`;

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  // Handle the confirmation dialog
  page.on('dialog', async dialog => {
    console.log('   Dialog appeared:', dialog.message());
    await dialog.accept();
  });

  console.log('1. Navigating to http://localhost:3002...');
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });

  // First clear localStorage
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });

  console.log('2. Creating initial project with translation...');
  await page.type('textarea', sampleText);

  // Change title
  const titleInput = await page.$('input[type="text"]');
  await titleInput.click({ clickCount: 3 });
  await titleInput.type('My Test Project');

  const translateButton = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(btn => btn.textContent.includes('Translate'));
  });
  await translateButton.click();

  await page.waitForSelector('ruby, .word-unit', { timeout: 60000 });
  await new Promise(r => setTimeout(r, 2000));

  console.log('3. Taking screenshot of initial project...');
  await page.screenshot({ path: 'screenshots/new-project-01-before.png', fullPage: true });

  // Check current state
  const beforeTitle = await page.$eval('input[type="text"]', el => el.value);
  const beforeWordUnits = await page.$$eval('.word-unit', els => els.length);
  console.log(`   Before: Title="${beforeTitle}", Word units=${beforeWordUnits}`);

  console.log('4. Clicking New Project button...');
  const newProjectButton = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(btn => btn.textContent.includes('New Project'));
  });
  await newProjectButton.click();

  await new Promise(r => setTimeout(r, 1000));

  console.log('5. Taking screenshot after New Project...');
  await page.screenshot({ path: 'screenshots/new-project-02-after.png', fullPage: true });

  // Check state after New Project
  const afterTitle = await page.$eval('input[type="text"]', el => el.value);
  const afterWordUnits = await page.$$eval('.word-unit', els => els.length);

  console.log(`   After: Title="${afterTitle}", Word units=${afterWordUnits}`);

  console.log('\n=== VERIFICATION: New Project ===');

  // Check that data is cleared
  const dataClearedOrReset = afterWordUnits === 0 || afterTitle === 'Genesis';
  console.log(`Data cleared/reset: ${dataClearedOrReset ? '✓ PASS' : '✗ FAIL'}`);

  // Check that default title is restored
  const defaultTitle = afterTitle === 'Genesis';
  console.log(`Default title restored (Genesis): ${defaultTitle ? '✓ PASS' : '✗ FAIL'}`);

  // Check that word units were cleared
  const wordUnitsCleared = afterWordUnits === 0;
  console.log(`Word units cleared: ${wordUnitsCleared ? '✓ PASS' : '✗ FAIL'}`);

  await browser.close();
  console.log('\nDone!');
})();
