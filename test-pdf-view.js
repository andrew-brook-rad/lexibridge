const puppeteer = require('puppeteer');

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testPDFView() {
  console.log('Testing PDF View...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });

  async function clickButtonByText(text) {
    const buttons = await page.$$('button');
    for (const button of buttons) {
      const buttonText = await page.evaluate(el => el.textContent, button);
      if (buttonText && buttonText.trim() === text) {
        await button.click();
        return true;
      }
    }
    // Try partial match if exact fails
    for (const button of buttons) {
      const buttonText = await page.evaluate(el => el.textContent, button);
      if (buttonText && buttonText.includes(text)) {
        await button.click();
        return true;
      }
    }
    return false;
  }

  try {
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle0', timeout: 30000 });
    console.log('1. Page loaded');

    // Load sample data
    await clickButtonByText('Genesis (DE)');
    await delay(2000);
    console.log('2. Sample data loaded');

    // Make sure we're in PDF view
    const clicked = await clickButtonByText('PDF');
    console.log('3. Clicked PDF button:', clicked);
    await delay(3000);

    // Check what view we're in
    const currentView = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      let activeView = '';
      buttons.forEach(btn => {
        if (btn.classList.contains('bg-blue-500') || btn.classList.contains('bg-blue-600')) {
          activeView = btn.textContent.trim();
        }
      });
      return activeView;
    });
    console.log('4. Current view:', currentView);

    // Take screenshot
    await page.screenshot({ path: 'screenshots/pdf-test-view.png', fullPage: true });
    console.log('5. Screenshot saved');

    // Check for iframe (PDF viewer)
    const iframe = await page.$('iframe');
    console.log('6. PDF iframe found:', !!iframe);

    // Check for PDF Preview text
    const hasPDFPreview = await page.evaluate(() => {
      return document.body.innerText.includes('PDF Preview');
    });
    console.log('7. Has PDF Preview label:', hasPDFPreview);

    // Check for Download PDF button
    const hasDownloadBtn = await page.evaluate(() => {
      return document.body.innerText.includes('Download PDF');
    });
    console.log('8. Has Download PDF button:', hasDownloadBtn);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
  }
}

testPDFView();
