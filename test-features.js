const puppeteer = require('puppeteer');

// Helper to wait
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testFeatures() {
  console.log('Starting feature tests...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  // Helper to click button by text
  async function clickButtonByText(text) {
    const buttons = await page.$$('button');
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
    // Navigate to the app
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle0', timeout: 30000 });
    console.log('1. Page loaded successfully');

    // Click "Genesis (DE)" button
    if (await clickButtonByText('Genesis (DE)')) {
      await delay(2000);
      console.log('2. Clicked Genesis (DE) button');
    } else {
      console.log('2. Genesis (DE) button not found');
    }

    // Take screenshot after loading sample data
    await page.screenshot({ path: 'screenshots/feature-01-sample-loaded.png', fullPage: true });
    console.log('3. Screenshot saved: feature-01-sample-loaded.png');

    // Check if PDF view is showing content
    const pdfFrame = await page.$('iframe');
    if (pdfFrame) {
      console.log('4. PDF iframe detected');
    } else {
      console.log('4. No PDF iframe - checking for other content');
    }

    // Switch to Book Spread view
    if (await clickButtonByText('Book Spread')) {
      await delay(1000);
      await page.screenshot({ path: 'screenshots/feature-02-book-spread.png', fullPage: true });
      console.log('5. Screenshot saved: feature-02-book-spread.png');
    }

    // Switch to Single Page view
    if (await clickButtonByText('Single Page')) {
      await delay(1000);
      await page.screenshot({ path: 'screenshots/feature-03-single-page.png', fullPage: true });
      console.log('6. Screenshot saved: feature-03-single-page.png');
    }

    // Test Edit Mode
    if (await clickButtonByText('Edit Mode')) {
      await delay(500);
      await page.screenshot({ path: 'screenshots/feature-04-edit-mode.png', fullPage: true });
      console.log('7. Screenshot saved: feature-04-edit-mode.png (Edit mode enabled)');
    }

    // Switch back to PDF view
    if (await clickButtonByText('PDF')) {
      await delay(2000);
      await page.screenshot({ path: 'screenshots/feature-05-pdf-view.png', fullPage: true });
      console.log('8. Screenshot saved: feature-05-pdf-view.png');
    }

    // Change page size to test reflow
    await page.select('select', '5.5x8.5');
    await delay(500);

    // Click Reflow button
    if (await clickButtonByText('Reflow')) {
      await delay(2000);
      await page.screenshot({ path: 'screenshots/feature-06-reflow.png', fullPage: true });
      console.log('9. Screenshot saved: feature-06-reflow.png (after page size change)');
    }

    console.log('\n=== Feature tests completed successfully ===');

  } catch (err) {
    console.error('Test error:', err.message);
    await page.screenshot({ path: 'screenshots/feature-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testFeatures();
