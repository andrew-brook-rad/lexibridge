const puppeteer = require('puppeteer');

// Genesis 1:7 text
const sampleText = `7 Da machte Gott die Feste und schied das Wasser unter der Feste von dem Wasser über der Feste. Und es geschah also.`;

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

  console.log('2. Filling in Genesis 1:7 text...');
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
  await page.screenshot({ path: 'screenshots/genesis-1-7-test.png', fullPage: true });

  // Check for specific glosses
  const allGlosses = await page.$$eval('rt, .gloss-text', els => els.map(el => el.textContent.trim().toUpperCase()));
  console.log('All glosses found:', allGlosses);

  // Check for key words
  const sourceTexts = await page.$$eval('rb, .source-text', els => els.map(el => el.textContent.trim()));
  console.log('Source texts found:', sourceTexts);

  console.log('\n=== VERIFICATION ===');

  // Look for "über" (OVER/ABOVE)
  const ueberIndex = sourceTexts.findIndex(t => t.toLowerCase() === 'über');
  console.log('Looking for "über" (OVER/ABOVE):');
  if (ueberIndex >= 0) {
    console.log(`  Found "über" at index ${ueberIndex}, gloss: ${allGlosses[ueberIndex]}`);
    const ueberGloss = allGlosses[ueberIndex];
    if (ueberGloss && (ueberGloss.includes('OVER') || ueberGloss.includes('ABOVE'))) {
      console.log('  ✓ PASS: über glosses to OVER/ABOVE');
    } else {
      console.log(`  ✗ FAIL: über glosses to "${ueberGloss}" instead of OVER/ABOVE`);
    }
  } else {
    console.log('  ✗ FAIL: über not found in source texts');
  }

  // Look for "der" (THE)
  const derIndex = sourceTexts.findIndex(t => t.toLowerCase() === 'der');
  console.log('\nLooking for "der" (THE):');
  if (derIndex >= 0) {
    console.log(`  Found "der" at index ${derIndex}, gloss: ${allGlosses[derIndex]}`);
    const derGloss = allGlosses[derIndex];
    if (derGloss && derGloss.includes('THE')) {
      console.log('  ✓ PASS: der glosses to THE');
    } else {
      console.log(`  ✗ FAIL: der glosses to "${derGloss}" instead of THE`);
    }
  } else {
    console.log('  ✗ FAIL: der not found in source texts');
  }

  // Look for "Feste" (FIRMAMENT/EXPANSE)
  const festeIndex = sourceTexts.findIndex(t => t.toLowerCase() === 'feste');
  console.log('\nLooking for "Feste" (FIRMAMENT/EXPANSE):');
  if (festeIndex >= 0) {
    console.log(`  Found "Feste" at index ${festeIndex}, gloss: ${allGlosses[festeIndex]}`);
    const festeGloss = allGlosses[festeIndex];
    if (festeGloss && (festeGloss.includes('FIRMAMENT') || festeGloss.includes('EXPANSE') || festeGloss.includes('DOME') || festeGloss.includes('VAULT'))) {
      console.log('  ✓ PASS: Feste glosses to FIRMAMENT/EXPANSE');
    } else {
      console.log(`  ✗ FAIL: Feste glosses to "${festeGloss}" instead of FIRMAMENT/EXPANSE`);
    }
  } else {
    console.log('  ✗ FAIL: Feste not found in source texts');
  }

  await browser.close();
  console.log('\nDone! Screenshot saved to screenshots/genesis-1-7-test.png');
})();
