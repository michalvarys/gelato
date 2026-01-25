const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testMobileView() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 }, // iPhone X
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  const page = await context.newPage();
  const screenshotsDir = path.join(__dirname, 'screenshots');

  // Create screenshots directory
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  const pages = [
    'index.html',
    'galerie.html',
    'o-nas.html',
    'recenze.html',
    'pobocka.html',
    'poptavka.html'
  ];

  for (const pageName of pages) {
    const filePath = `file://${path.join(__dirname, pageName)}`;
    console.log(`Testing: ${pageName}`);

    await page.goto(filePath);
    await page.waitForLoadState('networkidle');

    // Take full page screenshot
    await page.screenshot({
      path: path.join(screenshotsDir, `mobile-${pageName.replace('.html', '')}.png`),
      fullPage: true
    });

    // Test hamburger menu
    const hamburger = await page.$('#hamburger');
    if (hamburger) {
      await hamburger.click();
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(screenshotsDir, `mobile-${pageName.replace('.html', '')}-menu-open.png`),
        fullPage: false
      });
      await hamburger.click();
    }

    console.log(`  ✓ Screenshot saved for ${pageName}`);
  }

  await browser.close();
  console.log('\nAll screenshots saved to ./screenshots/');
}

testMobileView().catch(console.error);
