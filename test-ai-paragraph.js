const puppeteer = require('puppeteer');

async function testAIParagraphs() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  console.log('Navigating to app...');
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });

  // Click New Project button to start fresh
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.includes('New Project')) {
      page.once('dialog', async dialog => {
        await dialog.accept();
      });
      await btn.click();
      await new Promise(r => setTimeout(r, 1000));
      break;
    }
  }

  // Show input if needed
  const buttons2 = await page.$$('button');
  for (const btn of buttons2) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.includes('Show Input')) {
      await btn.click();
      await new Promise(r => setTimeout(r, 500));
      break;
    }
  }

  // Continuous text WITHOUT any paragraph markers
  // Contains 6 verses - the AI should suggest breaks
  const testText = `1 Am Anfang schuf Gott Himmel und Erde. 2 Und die Erde war wüst und leer, und es war finster auf der Tiefe. 3 Und Gott sprach: Es werde Licht! und es ward Licht. 4 Und Gott sah, daß das Licht gut war. 5 Da schied Gott das Licht von der Finsternis. 6 Und Gott nannte das Licht Tag und die Finsternis Nacht.`;

  console.log('Input text (no paragraph markers, continuous):');
  console.log(testText.substring(0, 100) + '...');

  // Enter text
  const textarea = await page.$('textarea');
  if (textarea) {
    await textarea.click({ clickCount: 3 });
    await page.keyboard.press('Backspace');
    await textarea.type(testText, { delay: 2 });
  }

  await page.screenshot({ path: 'screenshots/ai-para-01-input.png' });
  console.log('Screenshot 1: Input entered');

  // Click translate button
  const allButtons = await page.$$('button');
  for (const btn of allButtons) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.includes('Translate')) {
      await btn.click();
      break;
    }
  }

  // Wait for translation
  console.log('Waiting for translation (AI should suggest paragraph breaks)...');
  let found = false;
  for (let i = 0; i < 90; i++) {
    const paragraphs = await page.$$('.paragraph');
    if (paragraphs.length > 0) {
      found = true;
      console.log(`Found ${paragraphs.length} paragraphs after ${i+1} seconds`);
      break;
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({ path: 'screenshots/ai-para-02-result.png' });
  console.log('Screenshot 2: After translation');

  const paragraphs = await page.$$('.paragraph');
  console.log(`Final paragraph count: ${paragraphs.length}`);

  // Get verse numbers per paragraph
  const paragraphDetails = await page.evaluate(() => {
    const paragraphs = document.querySelectorAll('.paragraph');
    return Array.from(paragraphs).map((p, i) => {
      const verseNums = p.querySelectorAll('.verse-number');
      return {
        index: i,
        verseCount: verseNums.length,
        verseNumbers: Array.from(verseNums).map(v => v.textContent)
      };
    });
  });
  console.log('Paragraph details:', JSON.stringify(paragraphDetails, null, 2));

  await browser.close();

  console.log('\n=== TEST RESULTS ===');
  // The prompt says AI should suggest paragraph breaks every 3-5 verses
  // With 6 verses, we should get at least 2 paragraphs (maybe more)
  if (paragraphs.length >= 2) {
    console.log('SUCCESS: AI suggested paragraph breaks for continuous text!');
    console.log(`  - Split into ${paragraphs.length} paragraphs`);
    return true;
  } else if (paragraphs.length === 1) {
    console.log('PARTIAL: AI did not suggest paragraph breaks (only 1 paragraph)');
    console.log('  - This might still be acceptable depending on AI interpretation');
    return false;
  } else {
    console.log('FAIL: No paragraphs found');
    return false;
  }
}

testAIParagraphs().then(success => {
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
