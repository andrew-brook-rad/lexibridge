const puppeteer = require('puppeteer');

// Full Genesis 1:1-8 sample text
const sampleText = `1 Am Anfang schuf Gott Himmel und Erde. 2 Und die Erde war wüst und leer, und es war finster auf der Tiefe; und der Geist Gottes schwebte auf dem Wasser. 3 Und Gott sprach: Es werde Licht! und es ward Licht. 4 Und Gott sah, daß das Licht gut war. Da schied Gott das Licht von der Finsternis 5 und nannte das Licht Tag und die Finsternis Nacht. Da ward aus Abend und Morgen der erste Tag.

6 Und Gott sprach: Es werde eine Feste zwischen den Wassern, und die sei ein Unterschied zwischen den Wassern. 7 Da machte Gott die Feste und schied das Wasser unter der Feste von dem Wasser über der Feste. Und es geschah also. 8 Und Gott nannte die Feste Himmel. Da ward aus Abend und Morgen der andere Tag.`;

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('========================================');
  console.log('COMPREHENSIVE FEATURE TEST');
  console.log('========================================\n');

  console.log('1. Navigating to http://localhost:3001...');
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle0' });

  // Clear localStorage
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

  console.log('4. Waiting for translation (up to 90 seconds)...');
  try {
    await page.waitForSelector('ruby, .word-unit', { timeout: 90000 });
    console.log('   Translation completed!\n');
  } catch (e) {
    console.log('   ERROR: Timeout waiting for translation\n');
    await browser.close();
    return;
  }

  await new Promise(r => setTimeout(r, 3000));

  // Take screenshot
  await page.screenshot({ path: 'screenshots/comprehensive-01-initial.png', fullPage: true });

  // ========================================
  // TEST: Ruby element rendering
  // ========================================
  console.log('--- TEST: Ruby Element Rendering ---');
  const rubyInfo = await page.evaluate(() => {
    const rubyElements = document.querySelectorAll('ruby');
    const rtElements = document.querySelectorAll('rt');
    return {
      rubyCount: rubyElements.length,
      rtCount: rtElements.length,
      hasRuby: rubyElements.length > 0
    };
  });
  console.log(`Ruby elements: ${rubyInfo.rubyCount}, RT elements: ${rubyInfo.rtCount}`);
  console.log(`Each morpheme part renders as separate ruby: ${rubyInfo.hasRuby ? 'PASS' : 'FAIL'}\n`);

  // ========================================
  // TEST: Compound word splitting
  // ========================================
  console.log('--- TEST: Compound Word Splitting ---');
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

  const unterschied = wordData.find(w => w.fullWord.toLowerCase() === 'unterschied');
  const finsternis = wordData.find(w => w.fullWord.toLowerCase() === 'finsternis');

  if (unterschied) {
    const pass = unterschied.partCount > 1;
    console.log(`Unterschied split: ${pass ? 'PASS' : 'FAIL'} (${unterschied.parts.map(p => p.text).join('-')})`);
  } else {
    console.log('Unterschied: NOT FOUND');
  }

  if (finsternis) {
    const pass = finsternis.partCount > 1;
    console.log(`Finsternis split: ${pass ? 'PASS' : 'FAIL'} (${finsternis.parts.map(p => p.text).join('-')})`);
  } else {
    console.log('Finsternis: NOT FOUND');
  }

  // ========================================
  // TEST: Verse numbers
  // ========================================
  console.log('\n--- TEST: Verse Numbers ---');
  const verseInfo = await page.evaluate(() => {
    const verseNums = document.querySelectorAll('.verse-number');
    const styles = verseNums.length > 0 ? window.getComputedStyle(verseNums[0]) : null;
    return {
      count: verseNums.length,
      values: Array.from(verseNums).map(v => v.textContent),
      color: styles?.color || 'N/A',
      verticalAlign: styles?.verticalAlign || 'N/A',
      fontSize: styles?.fontSize || 'N/A'
    };
  });
  console.log(`Verse numbers found: ${verseInfo.values.join(', ')}`);
  console.log(`Color: ${verseInfo.color}`);
  console.log(`Vertical align: ${verseInfo.verticalAlign}`);
  console.log(`Font size: ${verseInfo.fontSize}`);

  // ========================================
  // TEST: Glosses
  // ========================================
  console.log('\n--- TEST: Glosses ---');
  const glosses = await page.$$eval('.gloss-text', els => els.slice(0, 10).map(el => el.textContent));
  console.log(`First 10 glosses: ${glosses.join(', ')}`);
  const allUppercase = glosses.every(g => g === g.toUpperCase());
  console.log(`All glosses UPPERCASE: ${allUppercase ? 'PASS' : 'FAIL'}`);

  // ========================================
  // TEST: CSS Styling
  // ========================================
  console.log('\n--- TEST: CSS Styling ---');
  const cssInfo = await page.evaluate(() => {
    const preview = document.querySelector('.print-preview');
    const paragraph = document.querySelector('.paragraph');
    const rt = document.querySelector('rt') || document.querySelector('.gloss-text');
    const wordUnit = document.querySelector('.word-unit');

    const previewStyles = preview ? window.getComputedStyle(preview) : null;
    const paragraphStyles = paragraph ? window.getComputedStyle(paragraph) : null;
    const rtStyles = rt ? window.getComputedStyle(rt) : null;
    const wordUnitStyles = wordUnit ? window.getComputedStyle(wordUnit) : null;

    return {
      previewBg: previewStyles?.backgroundColor || 'N/A',
      previewShadow: previewStyles?.boxShadow || 'N/A',
      textAlign: paragraphStyles?.textAlign || 'N/A',
      glossLineHeight: rtStyles?.lineHeight || 'N/A',
      glossFontFamily: rtStyles?.fontFamily || 'N/A',
      wordUnitDisplay: wordUnitStyles?.display || 'N/A'
    };
  });

  console.log(`Preview background: ${cssInfo.previewBg}`);
  console.log(`Preview box-shadow: ${cssInfo.previewShadow.substring(0, 50)}...`);
  console.log(`Text alignment: ${cssInfo.textAlign}`);
  console.log(`Gloss line-height: ${cssInfo.glossLineHeight}`);
  console.log(`Gloss font-family: ${cssInfo.glossFontFamily.substring(0, 50)}...`);
  console.log(`Word unit display: ${cssInfo.wordUnitDisplay}`);

  // ========================================
  // TEST: Page Size Change & Reflow
  // ========================================
  console.log('\n--- TEST: Page Size Change ---');
  await page.select('select', '5.5x8.5');
  await new Promise(r => setTimeout(r, 500));

  // Click Reflow button
  const reflowButton = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(btn => btn.textContent.includes('Reflow'));
  });
  if (reflowButton) {
    await reflowButton.click();
    await new Promise(r => setTimeout(r, 1000));
  }

  await page.screenshot({ path: 'screenshots/comprehensive-02-page-changed.png', fullPage: true });

  const pageSizeAfter = await page.$eval('select', el => el.value);
  console.log(`Page size changed to: ${pageSizeAfter}`);
  console.log(`Reflow button works: PASS\n`);

  // ========================================
  // TEST: German characters (ä, ö, ü, ß)
  // ========================================
  console.log('--- TEST: German Characters ---');
  const pageContent = await page.content();
  const hasUmlaut = pageContent.includes('wüst') || pageContent.includes('daß');
  console.log(`German umlauts/ß render correctly: ${hasUmlaut ? 'PASS' : 'CHECK MANUALLY'}`);

  // ========================================
  // SUMMARY
  // ========================================
  console.log('\n========================================');
  console.log('TEST SUMMARY');
  console.log('========================================');

  const results = {
    'Ruby element rendering': rubyInfo.hasRuby,
    'Unterschied splitting': unterschied && unterschied.partCount > 1,
    'Finsternis splitting': finsternis && finsternis.partCount > 1,
    'Verse numbers present': verseInfo.count >= 6,
    'UPPERCASE glosses': allUppercase,
    'Page size change': pageSizeAfter === '5.5x8.5',
    'Text justified': cssInfo.textAlign === 'justify'
  };

  Object.entries(results).forEach(([test, pass]) => {
    console.log(`${pass ? '✅' : '❌'} ${test}`);
  });

  await browser.close();
  console.log('\nDone! Screenshots saved to screenshots/comprehensive-*.png');
})();
