const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const sampleText = `1 Am Anfang schuf Gott Himmel und Erde.`;

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  // Set up download handling
  const downloadPath = path.resolve('./test-downloads');
  if (!fs.existsSync(downloadPath)) {
    fs.mkdirSync(downloadPath, { recursive: true });
  }

  // Enable download behavior
  const client = await page.createCDPSession();
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: downloadPath
  });

  console.log('1. Navigating to http://localhost:3002...');
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });

  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });

  console.log('2. Creating translation...');
  await page.type('textarea', sampleText);

  // Change title
  const titleInput = await page.$('input[type="text"]');
  await titleInput.click({ clickCount: 3 });
  await titleInput.type('TestExport');

  const translateButton = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(btn => btn.textContent.includes('Translate'));
  });
  await translateButton.click();

  await page.waitForSelector('ruby, .word-unit', { timeout: 60000 });
  await new Promise(r => setTimeout(r, 2000));

  console.log('3. Clicking Export button...');
  const exportButton = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(btn => btn.textContent.includes('Export'));
  });
  await exportButton.click();

  // Wait for download
  await new Promise(r => setTimeout(r, 2000));

  console.log('4. Checking for downloaded file...');
  // Check if file was downloaded
  const files = fs.readdirSync(downloadPath);
  const jsonFiles = files.filter(f => f.endsWith('.json'));
  console.log('Downloaded files:', jsonFiles);

  console.log('\n=== VERIFICATION: Export JSON ===');

  if (jsonFiles.length > 0) {
    const downloadedFile = path.join(downloadPath, jsonFiles[0]);
    const content = fs.readFileSync(downloadedFile, 'utf8');

    try {
      const parsed = JSON.parse(content);
      console.log('✓ PASS: JSON file was downloaded and is valid');

      // Check schema
      const hasTitle = parsed.meta && parsed.meta.title;
      console.log(`Has meta.title: ${hasTitle ? '✓ PASS' : '✗ FAIL'}`);

      const hasChapters = Array.isArray(parsed.chapters);
      console.log(`Has chapters array: ${hasChapters ? '✓ PASS' : '✗ FAIL'}`);

      const hasPrintSettings = parsed.printSettings !== undefined;
      console.log(`Has printSettings: ${hasPrintSettings ? '✓ PASS' : '✗ FAIL'}`);

      if (hasChapters && parsed.chapters.length > 0) {
        const chapter = parsed.chapters[0];
        const hasParagraphs = Array.isArray(chapter.paragraphs);
        console.log(`Chapter has paragraphs array: ${hasParagraphs ? '✓ PASS' : '✗ FAIL'}`);
      }

      console.log('\nExported JSON structure preview:');
      console.log('- meta.title:', parsed.meta?.title);
      console.log('- chapters count:', parsed.chapters?.length);
      console.log('- printSettings.pageSize:', parsed.printSettings?.pageSize);

      // Clean up
      fs.unlinkSync(downloadedFile);
    } catch (e) {
      console.log('✗ FAIL: JSON parsing error:', e.message);
    }
  } else {
    console.log('✗ FAIL: No JSON file was downloaded');
    console.log('Note: The export function creates a blob download which may not work in headless mode');

    // Alternative: check if the export function exists and works
    const exportData = await page.evaluate(() => {
      // Get the project data from localStorage
      const saved = localStorage.getItem('lexibridge-project');
      return saved;
    });

    if (exportData) {
      try {
        const parsed = JSON.parse(exportData);
        console.log('\nAlternative verification via localStorage:');
        console.log('✓ Project data exists in localStorage');
        console.log(`Has meta.title: ${parsed.meta?.title ? '✓ PASS' : '✗ FAIL'}`);
        console.log(`Has chapters array: ${Array.isArray(parsed.chapters) ? '✓ PASS' : '✗ FAIL'}`);
        console.log(`Has printSettings: ${parsed.printSettings ? '✓ PASS' : '✗ FAIL'}`);
        console.log('\nThe Export button would download this data as JSON.');
      } catch (e) {
        console.log('✗ FAIL: LocalStorage data is not valid JSON');
      }
    }
  }

  // Clean up download directory
  try {
    fs.rmdirSync(downloadPath, { recursive: true });
  } catch (e) {
    // Ignore cleanup errors
  }

  await browser.close();
  console.log('\nDone!');
})();
