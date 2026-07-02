import puppeteer from 'puppeteer';

const OUT = '/Users/luizfelipesilvacorreia/Downloads/nothing/case-behance/captures';
const URL = 'http://localhost:8899/';

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();

async function prep(width, height) {
  await page.setViewport({ width, height, deviceScaleFactor: 2 });
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    // estado final estático: sem .anim => estados base visíveis; congela keyframes
    document.documentElement.classList.remove('anim');
    const s = document.createElement('style');
    s.textContent = '*{animation:none!important;transition:none!important} html{scroll-behavior:auto!important}';
    document.head.appendChild(s);
  });
  await new Promise(r => setTimeout(r, 600)); // decode de imagens
}

async function shoot(sel, name) {
  const el = await page.$(sel);
  if (!el) { console.log('MISS', sel); return; }
  await el.screenshot({ path: `${OUT}/${name}.png` });
  console.log('ok', name);
}
// nav fixa + skip-link "assam" dentro dos prints de seção (captureBeyondViewport) — esconde
async function hideFixed() {
  await page.evaluate(() => {
    const s = document.createElement('style'); s.id = '__nofixed';
    s.textContent = '.nav,.skip-link{display:none!important}';
    document.head.appendChild(s);
  });
}

// ---- 1440 ----
await prep(1440, 900);
await shoot('.hero', 'hero-1440');
await page.screenshot({ path: `${OUT}/full-1440.png`, fullPage: true });
console.log('ok full-1440');
await hideFixed();
await shoot('.specs', 'specs-1440');
await shoot('#design', 'fone-1440');
await shoot('.ficha', 'ficha-1440');
await shoot('#som', 'som-1440');
await shoot('#comprar', 'closing-1440');
await shoot('.footer', 'footer-1440');

// detalhe: linhas da ficha (close-up de componente)
const rows = await page.$('.ficha__table');
if (rows) { await rows.screenshot({ path: `${OUT}/detail-tabela-1440.png` }); console.log('ok detail-tabela'); }

// ---- 1920 (hero p/ prancha de abertura/responsivo) ----
await prep(1920, 1000);
await shoot('.hero', 'hero-1920');
await page.screenshot({ path: `${OUT}/full-1920.png`, fullPage: true });
console.log('ok full-1920');

// ---- 393 ----
await prep(393, 852);
await shoot('.hero', 'hero-393');
await page.screenshot({ path: `${OUT}/full-393.png`, fullPage: true });
console.log('ok full-393');
await hideFixed();
await shoot('.specs', 'specs-393');
await shoot('#design', 'fone-393');
await shoot('.ficha', 'ficha-393');
await shoot('#som', 'som-393');

// menu mobile aberto (takeover) — nav de volta, sem anel de foco
await page.evaluate(() => {
  const nf = document.getElementById('__nofixed'); if (nf) nf.remove();
  document.documentElement.classList.add('anim'); // stagger base
  document.getElementById('navToggle').click();
  const s = document.createElement('style');
  s.textContent = '.menu,.menu *{transition:none!important} .anim .menu__item,.anim .menu__cta{opacity:1!important;transform:none!important} *:focus{outline:none!important}';
  document.head.appendChild(s);
  if (document.activeElement) document.activeElement.blur();
});
await new Promise(r => setTimeout(r, 300));
await page.screenshot({ path: `${OUT}/menu-393.png` });
console.log('ok menu-393');

await browser.close();
console.log('DONE');
