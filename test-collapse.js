const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('1. Navigating to http://localhost:3001...');
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle0' });

  // Check initial state - settings panel should be expanded
  console.log('2. Checking initial state...');
  await page.screenshot({ path: 'screenshots/collapse-01-initial.png', fullPage: true });

  // Check if settings panel is visible
  const settingsPanelExpanded = await page.$('.settings-panel.w-80') !== null;
  console.log('   Settings panel expanded:', settingsPanelExpanded);

  // Find the collapse button (the left arrow button in the header)
  console.log('3. Clicking collapse button...');
  const collapseButton = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(btn => btn.title === 'Collapse settings');
  });

  if (collapseButton) {
    await collapseButton.click();
    await new Promise(r => setTimeout(r, 500));
  }

  await page.screenshot({ path: 'screenshots/collapse-02-collapsed.png', fullPage: true });

  // Check if collapsed
  const settingsPanelCollapsed = await page.$('.settings-panel.w-12') !== null;
  console.log('   Settings panel collapsed:', settingsPanelCollapsed);

  // Click expand button
  console.log('4. Clicking expand button...');
  const expandButton = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(btn => btn.title === 'Expand settings');
  });

  if (expandButton) {
    await expandButton.click();
    await new Promise(r => setTimeout(r, 500));
  }

  await page.screenshot({ path: 'screenshots/collapse-03-expanded.png', fullPage: true });

  // Check if expanded again
  const settingsPanelExpandedAgain = await page.$('.settings-panel.w-80') !== null;
  console.log('   Settings panel expanded again:', settingsPanelExpandedAgain);

  await browser.close();
  console.log('Done! Collapse/expand test complete.');
})();
