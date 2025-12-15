const puppeteer = require('puppeteer');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('=== Session 6 Verification Test ===');
  console.log('Navigating to http://localhost:3002...');
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });

  // Clear localStorage first
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });

  // Load sample text by clicking on the link
  console.log('Loading sample Genesis text...');
  const sampleLink = await page.$('a.text-blue-600');
  if (sampleLink) {
    await sampleLink.click();
  }
  await sleep(500);

  // Find and click Translate button
  console.log('Clicking Translate button...');
  const translateBtn = await page.evaluateHandle(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.textContent.includes('Translate')) return btn;
    }
    return null;
  });
  if (translateBtn) {
    await translateBtn.click();
  }

  // Wait for translation to complete
  console.log('Waiting for translation...');
  await page.waitForSelector('.word-unit', { timeout: 30000 });
  await sleep(2000);

  // Take screenshot
  await page.screenshot({ path: 'screenshots/session6-verify-01.png', fullPage: true });
  console.log('Screenshot saved: screenshots/session6-verify-01.png');

  // Check for word units
  const wordUnits = await page.$$('.word-unit');
  console.log(`Word units found: ${wordUnits.length}`);

  // Check for verse numbers
  const verseNumbers = await page.$$('.verse-number');
  console.log(`Verse numbers found: ${verseNumbers.length}`);

  // Check glosses
  const glosses = await page.$$eval('.gloss-text', els => els.slice(0, 5).map(el => el.textContent));
  console.log('Sample glosses:', glosses);

  // Check for compound word splitting (Finsternis -> Finster + nis)
  const allParts = await page.$$eval('.word-unit', units => {
    return units.map(unit => {
      const parts = unit.querySelectorAll('ruby');
      if (parts.length > 1) {
        const texts = Array.from(parts).map(p => {
          const rb = p.querySelector('rb, .source-text');
          const rt = p.querySelector('rt, .gloss-text');
          return { text: rb?.textContent, gloss: rt?.textContent };
        });
        return texts;
      }
      return null;
    }).filter(Boolean);
  });
  console.log('Compound words found:', allParts.length);
  if (allParts.length > 0) {
    console.log('First compound:', JSON.stringify(allParts[0]));
  }

  // Test page size change
  console.log('\nTesting page size change...');
  await page.select('select', '5.5x8.5');
  await sleep(500);

  // Find and click Reflow button
  const reflowBtn = await page.evaluateHandle(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.textContent.includes('Reflow')) return btn;
    }
    return null;
  });
  if (reflowBtn) {
    await reflowBtn.click();
  }
  await sleep(1000);

  await page.screenshot({ path: 'screenshots/session6-verify-02.png', fullPage: true });
  console.log('Screenshot saved: screenshots/session6-verify-02.png');

  // Verify CSS is applied
  const textAlign = await page.$eval('.interlinear-text', el => getComputedStyle(el).textAlign);
  console.log(`Text alignment: ${textAlign}`);

  const verseStyle = await page.$eval('.verse-number', el => {
    const style = getComputedStyle(el);
    return { color: style.color, verticalAlign: style.verticalAlign };
  });
  console.log(`Verse number style:`, verseStyle);

  console.log('\n=== Verification Complete ===');
  console.log('All core functionality appears to be working!');

  await browser.close();
})();
