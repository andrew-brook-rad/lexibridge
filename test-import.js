const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('=== Test: Project can import from JSON format ===\n');

  // First, create a sample project JSON file
  const sampleProject = {
    "meta": { "title": "Imported Genesis", "language": "DE" },
    "printSettings": {
      "pageSize": "6x9",
      "margins": { "top": 0.75, "bottom": 0.75, "inner": 0.875, "outer": 0.5 },
      "baseFontSize": 12
    },
    "chapters": [
      {
        "number": 1,
        "paragraphs": [
          [
            { "type": "verse_num", "value": "1" },
            { "type": "word", "original_full": "Test", "parts": [{ "text": "Test", "gloss": "TEST" }] },
            { "type": "word", "original_full": "Import", "parts": [{ "text": "Import", "gloss": "IMPORT" }] },
            { "type": "punctuation", "value": "." }
          ]
        ]
      }
    ]
  };

  // Write the test file
  const testFilePath = path.join(__dirname, 'test-import-project.json');
  fs.writeFileSync(testFilePath, JSON.stringify(sampleProject, null, 2));
  console.log('1. Created test JSON file:', testFilePath);

  // Navigate to the app
  console.log('2. Navigating to http://localhost:3002...');
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });

  // Clear localStorage first
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });

  // Get initial title
  const initialTitle = await page.$eval('input[type="text"]', el => el.value);
  console.log('3. Initial title:', initialTitle);

  // Take screenshot before import
  await page.screenshot({ path: 'screenshots/import-01-before.png', fullPage: true });

  // Find the file input and upload the file
  console.log('4. Finding import input...');
  const fileInput = await page.$('input[type="file"][accept=".json"]');
  if (!fileInput) {
    console.log('ERROR: File input not found');
    await browser.close();
    return;
  }

  // Upload the file
  console.log('5. Uploading file...');
  await fileInput.uploadFile(testFilePath);
  await sleep(1000);

  // Check if the title changed
  const newTitle = await page.$eval('input[type="text"]', el => el.value);
  console.log('6. Title after import:', newTitle);

  // Check if word units appeared
  const wordUnits = await page.$$('.word-unit');
  console.log('7. Word units found:', wordUnits.length);

  // Take screenshot after import
  await page.screenshot({ path: 'screenshots/import-02-after.png', fullPage: true });

  // Verify the import worked
  if (newTitle === 'Imported Genesis' && wordUnits.length > 0) {
    console.log('\n✓ Test PASSED: Project imported successfully');
    console.log('  - Title changed to "Imported Genesis"');
    console.log('  - Word units rendered');
  } else {
    console.log('\n✗ Test FAILED:');
    if (newTitle !== 'Imported Genesis') {
      console.log('  - Title did not change');
    }
    if (wordUnits.length === 0) {
      console.log('  - No word units rendered');
    }
  }

  // Check localStorage to verify persistence
  const storedData = await page.evaluate(() => {
    const data = localStorage.getItem('lexibridge-project');
    return data ? JSON.parse(data) : null;
  });
  console.log('8. Stored title:', storedData?.meta?.title);

  // Clean up
  fs.unlinkSync(testFilePath);
  console.log('\nCleaned up test file');

  await browser.close();
})();
