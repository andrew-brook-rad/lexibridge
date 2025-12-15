const puppeteer = require('puppeteer');

async function testParagraphs() {
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

  // Simple 2-paragraph test with double newline
  const testText = `1 Am Anfang schuf Gott Himmel und Erde.

2 Und die Erde war wüst und leer.`;

  console.log('Text being sent (check for paragraph break):');
  console.log(JSON.stringify(testText));

  // Enter text
  const textarea = await page.$('textarea');
  if (textarea) {
    await textarea.click({ clickCount: 3 });
    await page.keyboard.press('Backspace');
    await textarea.type(testText, { delay: 5 });
  }

  await page.screenshot({ path: 'screenshots/para-simple-01-input.png' });
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

  // Wait for translation with longer timeout (90 seconds)
  console.log('Waiting for translation (up to 90 seconds)...');
  try {
    // Wait for loading to start
    await new Promise(r => setTimeout(r, 2000));

    // Wait for content to appear
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

    if (!found) {
      console.log('Timeout - no paragraphs found');
    }
  } catch (e) {
    console.log('Error waiting:', e.message);
  }

  await new Promise(r => setTimeout(r, 2000)); // Extra wait for render

  await page.screenshot({ path: 'screenshots/para-simple-02-result.png' });
  console.log('Screenshot 2: After translation');

  // Check results
  const paragraphs = await page.$$('.paragraph');
  console.log(`Final paragraph count: ${paragraphs.length}`);

  // Get paragraph content
  const paragraphContent = await page.evaluate(() => {
    const paragraphs = document.querySelectorAll('.paragraph');
    return Array.from(paragraphs).map((p, i) => ({
      index: i,
      textLength: p.textContent?.length || 0,
      hasVerseNum: p.querySelector('.verse-number') !== null
    }));
  });
  console.log('Paragraph details:', JSON.stringify(paragraphContent, null, 2));

  await browser.close();

  console.log('\n=== TEST RESULTS ===');
  if (paragraphs.length >= 2) {
    console.log('SUCCESS: Multiple paragraphs detected!');
    return true;
  } else if (paragraphs.length === 1) {
    console.log('PARTIAL: Only 1 paragraph - paragraphs may not be splitting correctly');
    return false;
  } else {
    console.log('FAIL: No paragraphs found');
    return false;
  }
}

testParagraphs().then(success => {
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
