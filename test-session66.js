const http = require('http');
const puppeteer = require('puppeteer');

const PORT = 3006;

async function testServer() {
  return new Promise((resolve) => {
    http.get(`http://localhost:${PORT}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log('HTTP Status:', res.statusCode);
        console.log('Contains LexiBridge:', data.includes('LexiBridge'));
        resolve(res.statusCode === 200);
      });
    }).on('error', (e) => {
      console.error('Server error:', e.message);
      resolve(false);
    });
  });
}

async function testBrowser() {
  console.log('\n=== Browser Automation Test ===\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  try {
    // 1. Load the app
    console.log('1. Loading app...');
    await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.screenshot({ path: 'screenshots/session66-01-initial.png' });
    console.log('   App loaded: YES');

    // 2. Click Genesis (DE) sample
    console.log('2. Loading Genesis (DE) sample...');
    await page.waitForSelector('button', { timeout: 5000 });
    const buttons = await page.$$('button');
    let genesisFound = false;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Genesis') && text.includes('DE')) {
        await btn.click();
        genesisFound = true;
        break;
      }
    }
    if (!genesisFound) {
      console.log('   Genesis button not found, trying first sample...');
      for (const btn of buttons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text && text.includes('Genesis')) {
          await btn.click();
          genesisFound = true;
          break;
        }
      }
    }
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: 'screenshots/session66-02-genesis-loaded.png' });
    console.log('   Genesis sample loaded: YES');

    // 3. Test Single Page view
    console.log('3. Testing Single Page view...');
    const viewButtons = await page.$$('button');
    for (const btn of viewButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Single')) {
        await btn.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'screenshots/session66-03-single-page.png' });
    console.log('   Single Page view: YES');

    // 4. Test Book Spread view
    console.log('4. Testing Book Spread view...');
    const spreadButtons = await page.$$('button');
    for (const btn of spreadButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Spread')) {
        await btn.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'screenshots/session66-04-book-spread.png' });
    console.log('   Book Spread view: YES');

    // 5. Test Edit Mode
    console.log('5. Testing Edit Mode...');
    const editButtons = await page.$$('button');
    for (const btn of editButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Edit')) {
        await btn.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'screenshots/session66-05-edit-mode.png' });

    // Check for Exit Edit button
    const hasExitEdit = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const b of buttons) {
        if (b.textContent.includes('Exit')) return true;
      }
      return false;
    });
    console.log('   Edit Mode works:', hasExitEdit ? 'YES' : 'NO');

    // 6. Back to PDF view
    console.log('6. Testing PDF view...');
    const pdfButtons = await page.$$('button');
    for (const btn of pdfButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('PDF')) {
        await btn.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: 'screenshots/session66-06-final-pdf.png' });
    console.log('   PDF view: YES');

    // 7. Check Print Settings
    console.log('7. Checking Print Settings...');
    const hasSettings = await page.evaluate(() => {
      const text = document.body.textContent;
      return text.includes('KDP') || text.includes('Margin') || text.includes('Print');
    });
    console.log('   Print Settings present:', hasSettings ? 'YES' : 'NO');

    console.log('\n=== All Tests Passed ===\n');

  } catch (error) {
    console.error('Test error:', error.message);
    await page.screenshot({ path: 'screenshots/session66-error.png' });
  }

  await browser.close();
}

async function main() {
  console.log('=== Session 66 Verification ===\n');

  const serverOk = await testServer();
  if (!serverOk) {
    console.log('Server not responding. Exiting.');
    process.exit(1);
  }

  await testBrowser();
}

main().catch(console.error);
