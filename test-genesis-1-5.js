const puppeteer = require('puppeteer');

// Genesis 1:5 text
const sampleText = `5 und nannte das Licht Tag und die Finsternis Nacht. Da ward aus Abend und Morgen der erste Tag.`;

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('1. Navigating to http://localhost:3002...');
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });

  // Clear any localStorage data first
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });

  console.log('2. Filling in Genesis 1:5 text...');
  await page.type('textarea', sampleText);

  console.log('3. Clicking Translate button...');
  const translateButton = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(btn => btn.textContent.includes('Translate'));
  });
  await translateButton.click();

  // Wait for translation to complete
  console.log('4. Waiting for translation to complete (up to 60 seconds)...');
  try {
    await page.waitForSelector('ruby, .word-unit', { timeout: 60000 });
    console.log('   Translation completed!');
  } catch (e) {
    console.log('   Timeout waiting for translation, taking screenshot anyway...');
  }

  // Additional wait for rendering
  await new Promise(r => setTimeout(r, 2000));

  console.log('5. Taking screenshot...');
  await page.screenshot({ path: 'screenshots/genesis-1-5-test.png', fullPage: true });

  // Check for specific glosses
  const allGlosses = await page.$$eval('rt, .gloss-text', els => els.map(el => el.textContent.trim().toUpperCase()));
  console.log('All glosses found:', allGlosses);

  // Check for key words
  const sourceTexts = await page.$$eval('rb, .source-text', els => els.map(el => el.textContent.trim()));
  console.log('Source texts found:', sourceTexts);

  // Look for specific translations
  const tagIndex = sourceTexts.findIndex(t => t.toLowerCase() === 'tag');
  const nachtIndex = sourceTexts.findIndex(t => t.toLowerCase() === 'nacht');
  const undIndex = sourceTexts.findIndex(t => t.toLowerCase() === 'und');

  console.log('\n=== VERIFICATION ===');
  console.log('Looking for "Tag" (DAY):');
  if (tagIndex >= 0) {
    console.log(`  Found "Tag" at index ${tagIndex}, gloss: ${allGlosses[tagIndex]}`);
    const tagGloss = allGlosses[tagIndex];
    if (tagGloss && tagGloss.includes('DAY')) {
      console.log('  ✓ PASS: Tag glosses to DAY');
    } else {
      console.log(`  ✗ FAIL: Tag glosses to "${tagGloss}" instead of DAY`);
    }
  } else {
    console.log('  ✗ FAIL: Tag not found in source texts');
  }

  console.log('\nLooking for "Nacht" (NIGHT):');
  if (nachtIndex >= 0) {
    console.log(`  Found "Nacht" at index ${nachtIndex}, gloss: ${allGlosses[nachtIndex]}`);
    const nachtGloss = allGlosses[nachtIndex];
    if (nachtGloss && nachtGloss.includes('NIGHT')) {
      console.log('  ✓ PASS: Nacht glosses to NIGHT');
    } else {
      console.log(`  ✗ FAIL: Nacht glosses to "${nachtGloss}" instead of NIGHT`);
    }
  } else {
    console.log('  ✗ FAIL: Nacht not found in source texts');
  }

  console.log('\nLooking for "und" (AND):');
  if (undIndex >= 0) {
    console.log(`  Found "und" at index ${undIndex}, gloss: ${allGlosses[undIndex]}`);
    const undGloss = allGlosses[undIndex];
    if (undGloss && undGloss.includes('AND')) {
      console.log('  ✓ PASS: und glosses to AND');
    } else {
      console.log(`  ✗ FAIL: und glosses to "${undGloss}" instead of AND`);
    }
  } else {
    console.log('  ✗ FAIL: und not found in source texts');
  }

  await browser.close();
  console.log('\nDone! Screenshot saved to screenshots/genesis-1-5-test.png');
})();
