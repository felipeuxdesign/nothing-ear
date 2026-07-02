import puppeteer from 'puppeteer';

const OUT = '/Users/luizfelipesilvacorreia/Downloads/nothing/case-behance/export';
const URL = 'http://localhost:8899/case-behance/case.html';

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1500, height: 1200, deviceScaleFactor: 2 });
await page.goto(URL, { waitUntil: 'networkidle0' });
await page.evaluate(async () => {
  await document.fonts.ready;
  document.body.classList.add('exporting'); // esconde .mockup-note
});
await new Promise(r => setTimeout(r, 800));

const ids = await page.$$eval('.board', els => els.map(e => e.id));
let i = 0;
for (const id of ids) {
  const el = await page.$('#' + id);
  const n = String(i).padStart(2, '0');
  await el.screenshot({ path: `${OUT}/${n}-${id}.png` });
  console.log('ok', `${n}-${id}.png`);
  i++;
}
await browser.close();
console.log('DONE', ids.length, 'boards');
