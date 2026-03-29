import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:4321/library/');
  
  // Dump Color Picker card HTML before search
  const cardBefore = await page.$eval('[data-slug="color-picker"]', el => el.outerHTML);
  console.log("=== BEFORE SEARCH ===");
  console.log(cardBefore);

  // Type in search
  await page.type('#search-input', 'colo');
  await new Promise(r => setTimeout(r, 1000));

  // Dump Color Picker card HTML after search
  const cardAfter = await page.$eval('[data-slug="color-picker"]', el => el.outerHTML);
  console.log("\n=== AFTER SEARCH ===");
  console.log(cardAfter);

  await browser.close();
})();
