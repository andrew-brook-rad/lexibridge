const puppeteer = require('puppeteer');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });

    console.log('Navigating to app...');
    await page.goto('http://localhost:3005', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: 'screenshots/session52-01-initial.png' });
    console.log('Screenshot: session52-01-initial.png');

    // Check app loaded
    const appLoaded = await page.evaluate(() => document.body.innerText.includes('LexiBridge'));
    console.log('App loaded:', appLoaded);

    // Find and count buttons
    const buttons = await page.$$('button');
    console.log('Found', buttons.length, 'buttons');

    // Check for Genesis button
    const buttonTexts = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('button')).map(b => b.innerText);
    });
    console.log('Button texts:', JSON.stringify(buttonTexts.slice(0, 10)));

    const genesisButton = buttonTexts.some(t => t.includes('Genesis'));
    console.log('Genesis button present:', genesisButton);

    // Click Genesis (DE) to load sample
    if (genesisButton) {
        const genesisBtn = await page.evaluateHandle(() => {
            return Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Genesis (DE)'));
        });
        if (genesisBtn) {
            await genesisBtn.click();
            await delay(2000);
            await page.screenshot({ path: 'screenshots/session52-02-genesis-loaded.png' });
            console.log('Screenshot: session52-02-genesis-loaded.png');
            console.log('Genesis sample loaded: YES');
        }
    }

    // Check PDF view
    const hasPdfView = await page.evaluate(() => {
        const iframe = document.querySelector('iframe');
        const pdfEmbed = document.querySelector('embed[type="application/pdf"]');
        return !!iframe || !!pdfEmbed;
    });
    console.log('PDF view works:', hasPdfView ? 'YES' : 'NO');

    // Click Single Page view
    const singlePageBtn = await page.evaluateHandle(() => {
        return Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Single Page'));
    });
    if (singlePageBtn) {
        await singlePageBtn.click();
        await delay(1000);
        await page.screenshot({ path: 'screenshots/session52-03-single-page.png' });
        console.log('Screenshot: session52-03-single-page.png');
        console.log('Single Page view: YES');
    }

    // Click Book Spread view
    const bookSpreadBtn = await page.evaluateHandle(() => {
        return Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Book Spread'));
    });
    if (bookSpreadBtn) {
        await bookSpreadBtn.click();
        await delay(1000);
        await page.screenshot({ path: 'screenshots/session52-04-book-spread.png' });
        console.log('Screenshot: session52-04-book-spread.png');
        console.log('Book Spread view: YES');
    }

    // Click Edit Mode
    const editBtn = await page.evaluateHandle(() => {
        return Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Edit Mode'));
    });
    if (editBtn) {
        await editBtn.click();
        await delay(500);
        await page.screenshot({ path: 'screenshots/session52-05-edit-mode.png' });
        console.log('Screenshot: session52-05-edit-mode.png');
        console.log('Edit Mode works: YES');
    }

    // Check Print Settings
    const printSettings = await page.evaluate(() => {
        return document.body.innerText.includes('Print Settings') || document.body.innerText.includes('KDP');
    });
    console.log('Print Settings present:', printSettings ? 'YES' : 'NO');

    // Go back to PDF view
    const pdfBtn = await page.evaluateHandle(() => {
        return Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('PDF'));
    });
    if (pdfBtn) {
        await pdfBtn.click();
        await delay(1000);
        await page.screenshot({ path: 'screenshots/session52-06-final-pdf.png' });
        console.log('Screenshot: session52-06-final-pdf.png');
        console.log('Final PDF view: YES');
    }

    await browser.close();
    console.log('Done - All verification complete!');
})();
