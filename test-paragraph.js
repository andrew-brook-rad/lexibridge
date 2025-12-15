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

  // Take initial screenshot
  await page.screenshot({ path: 'screenshots/paragraph-01-initial.png' });
  console.log('Screenshot 1: Initial state');

  // Check if we need to click New Project button (clear existing project)
  const buttons = await page.$$('button');
  let hasContent = await page.$('.interlinear-text');

  if (hasContent) {
    // Find and click New Project button
    for (const btn of buttons) {
      const text = await btn.evaluate(el => el.textContent);
      if (text && text.includes('New Project')) {
        page.once('dialog', async dialog => {
          await dialog.accept();
        });
        await btn.click();
        await new Promise(r => setTimeout(r, 500));
        break;
      }
    }
  }

  // Check if we need to show input
  const buttons2 = await page.$$('button');
  for (const btn of buttons2) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.includes('Show Input')) {
      await btn.click();
      await new Promise(r => setTimeout(r, 300));
      break;
    }
  }

  // Enter text with double newlines (paragraph markers)
  const testText = `1 Am Anfang schuf Gott Himmel und Erde. 2 Und die Erde war wüst und leer, und es war finster auf der Tiefe; und der Geist Gottes schwebte auf dem Wasser. 3 Und Gott sprach: Es werde Licht! und es ward Licht.

4 Und Gott sah, daß das Licht gut war. Da schied Gott das Licht von der Finsternis 5 und nannte das Licht Tag und die Finsternis Nacht. Da ward aus Abend und Morgen der erste Tag.

6 Und Gott sprach: Es werde eine Feste zwischen den Wassern, und die sei ein Unterschied zwischen den Wassern.`;

  // Find textarea and enter text
  const textarea = await page.$('textarea');
  if (textarea) {
    await textarea.click({ clickCount: 3 });
    await textarea.type(testText, { delay: 1 });
  }

  await page.screenshot({ path: 'screenshots/paragraph-02-text-entered.png' });
  console.log('Screenshot 2: Text with paragraphs entered');

  // Click translate button
  const allButtons = await page.$$('button');
  for (const btn of allButtons) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.includes('Translate')) {
      await btn.click();
      break;
    }
  }

  // Wait for translation (up to 60 seconds)
  console.log('Waiting for translation...');
  try {
    await page.waitForSelector('.interlinear-text', { timeout: 60000 });
    await new Promise(r => setTimeout(r, 3000)); // Wait for full render
  } catch (e) {
    console.log('Timeout waiting for translation');
  }

  await page.screenshot({ path: 'screenshots/paragraph-03-translated.png' });
  console.log('Screenshot 3: After translation');

  // Check how many paragraphs are rendered
  const paragraphs = await page.$$('.paragraph');
  console.log(`Found ${paragraphs.length} paragraphs rendered`);

  // Verify paragraph spacing is visible
  const paragraphStyles = await page.evaluate(() => {
    const paragraphs = document.querySelectorAll('.paragraph');
    return Array.from(paragraphs).map((p, i) => {
      const style = window.getComputedStyle(p);
      return {
        index: i,
        marginBottom: style.marginBottom,
        marginTop: style.marginTop
      };
    });
  });
  console.log('Paragraph styles:', JSON.stringify(paragraphStyles, null, 2));

  await page.screenshot({ path: 'screenshots/paragraph-04-final.png', fullPage: true });
  console.log('Screenshot 4: Full page view');

  await browser.close();

  console.log('\n=== TEST RESULTS ===');
  if (paragraphs.length >= 2) {
    console.log('SUCCESS: Multiple paragraphs detected!');
    console.log(`  - ${paragraphs.length} paragraphs rendered`);
    return true;
  } else {
    console.log('NEEDS WORK: Only 1 paragraph or no paragraphs detected');
    console.log('  - The API may not be splitting paragraphs correctly');
    return false;
  }
}

testParagraphs().then(success => {
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
