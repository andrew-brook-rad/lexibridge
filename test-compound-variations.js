const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('Testing compound word variations...\n');

  // Navigate to app
  await page.goto('http://localhost:3003', { waitUntil: 'networkidle0' });

  // Clear localStorage and reload
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });

  // Test text with various compound words
  const testText = `1 Der Handschuh ist warm. 2 Es geschah gestern. 3 Die Unabhängigkeitserklärung wurde geschrieben.`;

  console.log('Test text:', testText);
  console.log('\nExpected splits:');
  console.log('  - Handschuh -> Hand + schuh (HAND + SHOE)');
  console.log('  - geschah -> ge + schah (prefix + HAPPENED)');
  console.log('  - Unabhängigkeitserklärung -> Un + abhängigkeit + s + erklärung (possible 3+ parts)');
  console.log('  - geschrieben -> ge + schrieben (prefix + WRITTEN)\n');

  // Type into textarea
  await page.type('textarea', testText);
  await page.screenshot({ path: 'screenshots/compound-var-01-input.png', fullPage: true });

  // Click Translate
  console.log('Translating... (this takes ~30-60 seconds)');
  const translateBtn = await page.$('button.bg-green-600');
  await translateBtn.click();

  try {
    await page.waitForSelector('.word-unit', { timeout: 120000 });
    console.log('Translation complete!\n');
  } catch (e) {
    console.log('Translation failed:', e.message);
    await page.screenshot({ path: 'screenshots/compound-var-error.png', fullPage: true });
    await browser.close();
    return;
  }

  await page.screenshot({ path: 'screenshots/compound-var-02-result.png', fullPage: true });

  // Analyze the compound words
  const compounds = await page.$$('.word-unit.compound');
  console.log('=== Compound Words Found ===');
  console.log('Total compound words:', compounds.length);

  for (let i = 0; i < compounds.length; i++) {
    const data = await compounds[i].evaluate(el => {
      const parts = el.querySelectorAll('.source-text');
      const glosses = el.querySelectorAll('.gloss-text');
      return {
        original: el.textContent.replace(/\s+/g, ' ').substring(0, 100),
        parts: Array.from(parts).map(p => p.textContent),
        glosses: Array.from(glosses).map(g => g.textContent)
      };
    });

    console.log(`\n${i + 1}. "${data.parts.join('-')}"`);
    console.log(`   Parts: [${data.parts.join(', ')}]`);
    console.log(`   Glosses: [${data.glosses.join(', ')}]`);
  }

  // Check for specific words
  console.log('\n=== Checking Specific Compound Words ===');

  // Check for Handschuh
  const handschuhFound = await page.evaluate(() => {
    const text = document.body.textContent;
    return text.includes('Hand') && text.includes('schuh');
  });
  console.log('Handschuh split (Hand + schuh):', handschuhFound ? 'YES' : 'NO');

  // Check for ge- prefix words
  const geFound = await page.evaluate(() => {
    const compounds = document.querySelectorAll('.word-unit.compound');
    let geCount = 0;
    compounds.forEach(c => {
      const parts = c.querySelectorAll('.source-text');
      if (parts.length > 0 && parts[0].textContent.toLowerCase() === 'ge') {
        geCount++;
      }
    });
    return geCount;
  });
  console.log('Words with ge- prefix split:', geFound);

  // Count all word units
  const allWords = await page.$$('.word-unit');
  console.log('\nTotal word units:', allWords.length);
  console.log('Compound words:', compounds.length);
  console.log('Simple words:', allWords.length - compounds.length);

  console.log('\n=== Test Complete ===');
  console.log('Screenshots saved: compound-var-01-input.png, compound-var-02-result.png');

  await browser.close();
})();
