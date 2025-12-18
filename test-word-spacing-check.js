const puppeteer = require('puppeteer');

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  let page;
  try {
    page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 1200 });

    console.log('Loading app...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle0', timeout: 30000 });

    // Click Genesis (DE)
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const btnText = await btn.evaluate(el => el.textContent);
      if (btnText && btnText.includes('Genesis (DE)')) {
        await btn.click();
        break;
      }
    }
    await sleep(2000);

    // Take a tall screenshot to capture the full settings panel
    await page.screenshot({ path: 'screenshots/word-spacing-check.png', fullPage: true });

    // Check for Word Spacing text in the page
    const pageContent = await page.evaluate(() => document.body.innerText);

    // Look for specific word spacing related text
    const hasWordSpacing = pageContent.includes('Word Spacing');
    const hasMin = pageContent.includes('Min');
    const hasMax = pageContent.includes('Max');

    console.log('\n=== WORD SPACING CHECK ===');
    console.log('Word Spacing section found:', hasWordSpacing ? '✓ Yes' : '✗ No');
    console.log('Min control found:', hasMin ? '✓ Yes' : '✗ No');
    console.log('Max control found:', hasMax ? '✓ Yes' : '✗ No');

    // Extract the relevant section
    const lines = pageContent.split('\n');
    const wordSpacingLines = [];
    let inSection = false;
    for (const line of lines) {
      if (line.includes('Word Spacing')) {
        inSection = true;
      }
      if (inSection && line.trim()) {
        wordSpacingLines.push(line.trim());
        if (wordSpacingLines.length > 5) break;
      }
    }

    if (wordSpacingLines.length > 0) {
      console.log('\nWord Spacing section content:');
      wordSpacingLines.forEach(l => console.log('  ', l));
    }

    console.log('\nScreenshot saved to screenshots/word-spacing-check.png');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
