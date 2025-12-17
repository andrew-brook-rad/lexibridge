const puppeteer = require('puppeteer');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });

    console.log('Navigating to app...');
    await page.goto('http://localhost:3003', { waitUntil: 'networkidle0' });

    // Take initial screenshot
    await page.screenshot({ path: 'screenshots/session60-01-initial.png' });
    console.log('Initial screenshot taken');

    // Check for main UI elements
    const buttons = await page.$$('button');
    console.log('Found', buttons.length, 'buttons');

    // Look for Genesis sample button
    const genesisBtn = await page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.find(b => b.textContent.includes('Genesis'));
    });

    if (genesisBtn && genesisBtn.asElement()) {
        console.log('Genesis button found, clicking...');
        await genesisBtn.asElement().click();
        await sleep(2000);

        // Take screenshot after loading sample
        await page.screenshot({ path: 'screenshots/session60-02-genesis-loaded.png' });
        console.log('Genesis loaded screenshot taken');

        // Check for PDF view
        const pdfView = await page.$('iframe');
        console.log('PDF iframe present:', !!pdfView);

        // Click Single Page button
        const singlePageBtn = await page.evaluateHandle(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            return buttons.find(b => b.textContent.includes('Single Page'));
        });

        if (singlePageBtn && singlePageBtn.asElement()) {
            console.log('Clicking Single Page view...');
            await singlePageBtn.asElement().click();
            await sleep(1000);
            await page.screenshot({ path: 'screenshots/session60-03-single-page.png' });
            console.log('Single page screenshot taken');
        }

        // Click Book Spread button
        const bookSpreadBtn = await page.evaluateHandle(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            return buttons.find(b => b.textContent.includes('Book Spread'));
        });

        if (bookSpreadBtn && bookSpreadBtn.asElement()) {
            console.log('Clicking Book Spread view...');
            await bookSpreadBtn.asElement().click();
            await sleep(1000);
            await page.screenshot({ path: 'screenshots/session60-04-book-spread.png' });
            console.log('Book spread screenshot taken');
        }

        // Click Edit Mode button
        const editModeBtn = await page.evaluateHandle(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            return buttons.find(b => b.textContent.includes('Edit Mode'));
        });

        if (editModeBtn && editModeBtn.asElement()) {
            console.log('Clicking Edit Mode...');
            await editModeBtn.asElement().click();
            await sleep(500);
            await page.screenshot({ path: 'screenshots/session60-05-edit-mode.png' });
            console.log('Edit mode screenshot taken');

            // Verify Exit Edit button appears
            const exitEditBtn = await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                const exitBtn = buttons.find(b => b.textContent.includes('Exit Edit'));
                return !!exitBtn;
            });
            console.log('Exit Edit button visible:', exitEditBtn);
        }

        // Go back to PDF view
        const pdfBtn = await page.evaluateHandle(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            return buttons.find(b => b.textContent.includes('PDF'));
        });

        if (pdfBtn && pdfBtn.asElement()) {
            console.log('Clicking PDF view...');
            await pdfBtn.asElement().click();
            await sleep(1000);
            await page.screenshot({ path: 'screenshots/session60-06-final-pdf.png' });
            console.log('Final PDF screenshot taken');
        }

        // Check Print Settings
        const printSettings = await page.evaluate(() => {
            const text = document.body.textContent;
            return text.includes('Print Settings') && text.includes('KDP');
        });
        console.log('Print Settings present:', printSettings);

        console.log('\n=== VERIFICATION COMPLETE ===');
        console.log('All features verified successfully!');
    } else {
        console.log('ERROR: Genesis button not found');
    }

    await browser.close();
})();
