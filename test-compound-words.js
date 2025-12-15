const puppeteer = require('puppeteer');

// Test text containing compound words that should be split
const sampleText = `6 Und Gott sprach: Es werde eine Feste zwischen den Wassern, und die sei ein Unterschied zwischen den Wassern. 7 Da machte Gott die Feste und schied das Wasser unter der Feste von dem Wasser über der Feste. Und es geschah also. 8 Und Gott nannte die Feste Himmel. Da ward aus Abend und Morgen der andere Tag.`;

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('1. Navigating to http://localhost:3001...');
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle0' });

  // Clear any localStorage data first
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });

  console.log('2. Filling in sample text with compound words...');
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
  await page.screenshot({ path: 'screenshots/compound-words-test.png', fullPage: true });

  // Check for compound words in the output
  console.log('\n6. Analyzing compound word splitting...');

  // Get all word units and their parts
  const wordData = await page.evaluate(() => {
    const wordUnits = document.querySelectorAll('.word-unit');
    const results = [];
    wordUnits.forEach(unit => {
      const sourceTexts = unit.querySelectorAll('.source-text');
      const glossTexts = unit.querySelectorAll('.gloss-text');
      const parts = [];
      sourceTexts.forEach((src, idx) => {
        parts.push({
          text: src.textContent,
          gloss: glossTexts[idx]?.textContent || ''
        });
      });
      if (parts.length > 0) {
        const fullWord = Array.from(sourceTexts).map(s => s.textContent).join('');
        results.push({
          fullWord,
          partCount: parts.length,
          parts
        });
      }
    });
    return results;
  });

  // Check for specific compound words
  const unterschied = wordData.find(w => w.fullWord.toLowerCase() === 'unterschied');
  const finsternis = wordData.find(w => w.fullWord.toLowerCase() === 'finsternis');

  console.log('\n--- Compound Word Analysis ---');

  if (unterschied) {
    console.log(`\nUnterschied found:`);
    console.log(`  Parts: ${unterschied.partCount}`);
    console.log(`  Details: ${JSON.stringify(unterschied.parts)}`);
    if (unterschied.partCount > 1) {
      console.log('  ✅ Successfully split into multiple parts!');
    } else {
      console.log('  ❌ NOT split - has only 1 part');
    }
  } else {
    console.log('\nUnterschied NOT found in the output');
  }

  // Look for any multi-part words
  const multiPartWords = wordData.filter(w => w.partCount > 1);
  console.log(`\nMulti-part words found: ${multiPartWords.length}`);
  multiPartWords.forEach(w => {
    console.log(`  - ${w.fullWord}: ${w.partCount} parts - ${w.parts.map(p => p.text).join('-')}`);
  });

  // List all words for analysis
  console.log(`\nAll words (${wordData.length} total):`);
  wordData.forEach(w => {
    const splitInfo = w.partCount > 1 ? ` [SPLIT: ${w.parts.map(p => p.text).join('-')}]` : '';
    console.log(`  ${w.fullWord}${splitInfo}`);
  });

  await browser.close();
  console.log('\nDone! Screenshot saved to screenshots/compound-words-test.png');
})();
