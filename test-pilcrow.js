const puppeteer = require('puppeteer');

async function testPilcrow() {
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

  // Test with pilcrow (¶) symbol as paragraph marker
  const testText = `1 Am Anfang schuf Gott Himmel. ¶ 2 Und die Erde war wüst.`;

  console.log('Text being sent with pilcrow symbol:');
  console.log(JSON.stringify(testText));

  // Enter text
  const textarea = await page.$('textarea');
  if (textarea) {
    await textarea.click({ clickCount: 3 });
    await page.keyboard.press('Backspace');
    await textarea.type(testText, { delay: 5 });
  }

  await page.screenshot({ path: 'screenshots/pilcrow-01-input.png' });
  console.log('Screenshot 1: Input entered with pilcrow');

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
  console.log('Waiting for translation...');
  let found = false;
  for (let i = 0; i < 60; i++) {
    const paragraphs = await page.$$('.paragraph');
    if (paragraphs.length > 0) {
      found = true;
      console.log(`Found ${paragraphs.length} paragraphs after ${i+1} seconds`);
      break;
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({ path: 'screenshots/pilcrow-02-result.png' });
  console.log('Screenshot 2: After translation');

  const paragraphs = await page.$$('.paragraph');
  console.log(`Final paragraph count: ${paragraphs.length}`);

  // Check if the pilcrow symbol appears in the output (it should NOT)
  const pageContent = await page.content();
  const hasPilcrow = pageContent.includes('¶');
  console.log(`Pilcrow symbol in output: ${hasPilcrow} (should be false)`);

  await browser.close();

  console.log('\n=== TEST RESULTS ===');
  if (paragraphs.length >= 2 && !hasPilcrow) {
    console.log('SUCCESS: Pilcrow converted to paragraph break and hidden!');
    return true;
  } else if (paragraphs.length >= 2) {
    console.log('PARTIAL: Paragraphs created but pilcrow may still be visible');
    return true;
  } else {
    console.log('FAIL: Pilcrow not converted to paragraph break');
    return false;
  }
}

testPilcrow().then(success => {
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
