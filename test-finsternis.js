const puppeteer = require('puppeteer');

// Test text containing Finsternis
const sampleText = `4 Und Gott sah, daß das Licht gut war. Da schied Gott das Licht von der Finsternis 5 und nannte das Licht Tag und die Finsternis Nacht. Da ward aus Abend und Morgen der erste Tag.`;

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

  console.log('2. Filling in sample text with Finsternis...');
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
  await page.screenshot({ path: 'screenshots/finsternis-test.png', fullPage: true });

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

  // Check for Finsternis
  const finsternisWords = wordData.filter(w => w.fullWord.toLowerCase() === 'finsternis');

  console.log('\n--- Finsternis Analysis ---');

  if (finsternisWords.length > 0) {
    finsternisWords.forEach((f, idx) => {
      console.log(`\nFinsternis #${idx+1} found:`);
      console.log(`  Parts: ${f.partCount}`);
      console.log(`  Details: ${JSON.stringify(f.parts)}`);
      if (f.partCount > 1) {
        console.log('  ✅ Successfully split into multiple parts!');
      } else {
        console.log('  ❌ NOT split - has only 1 part');
      }
    });
  } else {
    console.log('Finsternis NOT found in the output');
  }

  // Look for any multi-part words
  const multiPartWords = wordData.filter(w => w.partCount > 1);
  console.log(`\nMulti-part words found: ${multiPartWords.length}`);
  multiPartWords.forEach(w => {
    console.log(`  - ${w.fullWord}: ${w.partCount} parts - ${w.parts.map(p => `${p.text}(${p.gloss})`).join('-')}`);
  });

  await browser.close();
  console.log('\nDone!');
})();
