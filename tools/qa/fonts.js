// 실제 웹폰트(Pretendard·Barlow Condensed)를 로컬 npm 패키지로 대신 내려줌 — 검사 환경은 외부 CDN이 막혀 대체 글꼴로 그려져 글자 폭이 달라지기 때문
// 준비(한 번):  npm i --no-save --prefix tools/qa pretendard@1.3.9 @fontsource/barlow-condensed@5   (없으면 대체 글꼴로 검사하고 안내만 함)
const fs = require('fs'), path = require('path');
const NM = process.env.QA_FONT_NM || path.join(__dirname, 'node_modules');
module.exports = async function fontRoute(p) {
  const pre = path.join(NM, 'pretendard/dist/web/variable');
  const bar = path.join(NM, '@fontsource/barlow-condensed/files');
  if (!fs.existsSync(pre) || !fs.existsSync(bar)) return false;
  await p.route(/cdn\.jsdelivr\.net\/npm\/pretendard@[^/]+\/dist\/web\/variable\/(.*)$/, (r) => {
    const rel = decodeURIComponent(r.request().url().split('/dist/web/variable/')[1].split('?')[0]);
    const f = path.join(pre, rel); if (!fs.existsSync(f)) return r.abort();
    r.fulfill({ body: fs.readFileSync(f), contentType: f.endsWith('.css') ? 'text/css' : 'font/woff2', headers: { 'access-control-allow-origin': '*' } });
  });
  await p.route(/fonts\.googleapis\.com\/css2/, (r) => r.fulfill({ contentType: 'text/css', body: [500, 600, 700].map((w) => `@font-face{font-family:'Barlow Condensed';font-weight:${w};font-style:normal;font-display:swap;src:url(https://fonts.gstatic.com/local/bc-${w}.woff2) format('woff2')}`).join('\n') }));
  await p.route(/fonts\.gstatic\.com\/local\/bc-(\d+)\.woff2/, (r) => { const w = r.request().url().match(/bc-(\d+)/)[1]; r.fulfill({ body: fs.readFileSync(path.join(bar, `barlow-condensed-latin-${w}-normal.woff2`)), contentType: 'font/woff2', headers: { 'access-control-allow-origin': '*' } }); });
  return true;
};
