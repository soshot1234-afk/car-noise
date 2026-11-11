// 카스쿼드 — 검색용 차종 페이지 만들기
// 쓰는 법: (저장소 폴더에서) node tools/build_seo.js
//  1) index.html을 브라우저(Playwright)로 열어 앱이 계산한 능력치를 그대로 받아 옵니다.
//  2) car/<id>.html (차마다 한 장), cars.html (전체 목록), sitemap.xml, robots.txt 를 새로 씁니다.
// 데이터(가격·능력치)를 고친 뒤에는 이 스크립트를 다시 돌리면 페이지도 함께 갱신됩니다.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://carsquad.pages.dev';
const TODAY = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });

function serve() {
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
  const srv = http.createServer((req, res) => {
    let f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
    if (f.endsWith('/')) f += 'index.html';
    if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
  });
  return new Promise((ok) => srv.listen(0, '127.0.0.1', () => ok(srv)));
}

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const won = (v) => (v == null || isNaN(v) ? '–' : v >= 10000 ? (v / 10000).toFixed(v % 10000 ? 1 : 0) + '억 원' : Math.round(v).toLocaleString('ko-KR') + '만 원');
const cls = (v) => (isNaN(v) ? 'na' : v >= 16 ? 'hi' : v >= 11 ? 'md' : v >= 6 ? 'lo' : 'bad');
const josa = (w, a, b) => { const c = String(w).trim().slice(-1).charCodeAt(0); if (c < 0xac00 || c > 0xd7a3) return /[0-9LMNlmnR]$/.test(w) ? a : b; return (c - 0xac00) % 28 ? a : b; };
const REDIRECT = "<script>(function(){var h=location.hostname,p=location.pathname;if(/github\\.io$/.test(h)){p=p.replace(/^\\/car-noise/,'');}else if(!/(^|\\.)carrodor\\.pages\\.dev$/.test(h)){return;}location.replace('https://carsquad.pages.dev'+p+location.search+location.hash);})();</script>";

const CSS = `
@font-face{font-family:Jalnan;src:url(/fonts/yg-jalnan.woff2) format("woff2");font-display:swap}
:root{--bg:#eef0f3;--pn:#fff;--tx:#15171c;--mu:#5b616e;--line:#dfe2e7;--navy:#0f1115;--gold:#e3b448;--gold-t:#8a6a14;--hi:#0f8f47;--md:#6f8400;--lo:#c26600;--bad:#cc2f28}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--tx);font-family:"Pretendard Variable",Pretendard,-apple-system,"Apple SD Gothic Neo","Malgun Gothic",sans-serif;line-height:1.6}
a{color:#24365c}a:hover{color:#0f1115}
.top{background:var(--navy);color:#fff;border-bottom:4px solid;border-image:linear-gradient(90deg,#e2554c 0 25%,#e5a443 25% 50%,#c8d758 50% 75%,#45d37f 75%) 1}
.top .in{max-width:960px;margin:0 auto;padding:12px 16px;display:flex;align-items:center;gap:12px}
.top a{color:#fff;text-decoration:none;display:flex;align-items:center;gap:10px}.top img{width:34px;height:34px}
.top b{font-family:Jalnan,sans-serif;font-weight:400;font-size:22px;letter-spacing:.02em}.top small{color:var(--gold);font-size:12px}
main{max-width:960px;margin:0 auto;padding:16px 16px 40px}
.crumb{font-size:13px;color:var(--mu);margin:4px 0 10px}.crumb a{color:var(--mu)}
h1{font-family:Jalnan,sans-serif;font-weight:400;font-size:32px;line-height:1.25;margin:0 0 4px}
h2{font-family:Jalnan,sans-serif;font-weight:400;font-size:21px;margin:0 0 10px}
.sub{color:var(--mu);margin:0 0 14px}
.card{background:var(--pn);border:1px solid var(--line);border-radius:12px;padding:16px;margin:0 0 14px}
.hero{display:grid;grid-template-columns:auto 1fr;gap:18px;align-items:center}
.ovr{background:var(--navy);color:var(--gold);border-radius:12px;padding:12px 18px;text-align:center;min-width:110px}
.ovr b{display:block;font-size:46px;line-height:1;font-weight:800}.ovr span{font-size:12px;color:#c9ced7}
.facts{display:flex;flex-wrap:wrap;gap:6px 18px;font-size:14px}.facts b{font-weight:800}
.lead{margin:12px 0 0;font-size:15.5px}
.groups{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.g{border:1px solid var(--line);border-radius:10px;padding:10px 12px}.g span{font-size:13px;color:var(--mu)}.g b{display:block;font-size:24px}
.bar{height:6px;border-radius:3px;background:var(--line);overflow:hidden;margin-top:4px}.bar i{display:block;height:100%;background:linear-gradient(90deg,#e2554c,#e5a443,#c8d758,#45d37f)}
table{width:100%;border-collapse:collapse;font-size:14.5px}th,td{text-align:left;padding:8px 6px;border-top:1px solid var(--line);vertical-align:top}th{font-size:12.5px;color:var(--mu);font-weight:700;border-top:0}
td:first-child{white-space:nowrap;font-weight:700}td.s{font-weight:800;width:48px;text-align:center}.hi{color:var(--hi)}.md{color:var(--md)}.lo{color:var(--lo)}.bad{color:var(--bad)}.na{color:var(--mu)}
.cta{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}.btn{display:inline-block;padding:10px 16px;border-radius:8px;border:1px solid var(--line);background:#fff;color:var(--tx);text-decoration:none;font-weight:700;font-size:14.5px}
.btn.gold{background:var(--gold);border-color:var(--gold);color:#15171c}
ul.links{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:6px 16px}ul.links li{font-size:14.5px}ul.links small{color:var(--mu);margin-left:6px}
.note{font-size:12.5px;color:var(--mu)}
footer{max-width:960px;margin:0 auto;padding:0 16px 40px;font-size:12.5px;color:var(--mu)}
.brand-h{margin:22px 0 8px;font-family:Jalnan,sans-serif;font-weight:400;font-size:20px}
@media (max-width:640px){h1{font-size:25px}.hero{grid-template-columns:1fr}.groups{grid-template-columns:repeat(2,minmax(0,1fr))}.ovr{display:flex;align-items:baseline;gap:10px;justify-content:center}.ovr b{font-size:38px}}
`;

function head({ title, desc, url, jsonld }) {
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${REDIRECT}
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="카스쿼드">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/og.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0f1115">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css">
<link rel="stylesheet" href="/seo.css">
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>` : ''}
</head>
<body>
<header class="top"><div class="in"><a href="/"><img src="/favicon.svg" alt=""><span><b>CAR SQUAD</b><br><small>카스쿼드 · 차를 선수처럼</small></span></a></div></header>
<main>`;
}
const FOOT = `</main>
<footer>
<p>카스쿼드는 공개 자료로 국내 승용차를 1~20 능력치로 비교하는 개인 운영 사이트로, 제조사·판매사와 관계가 없습니다. 능력치는 참고용 상대 평가이며 가격·시세는 수집 시점 기준이라 실제와 다를 수 있습니다. 구매 전에는 공식 가격표와 시승으로 꼭 확인하세요.</p>
<p><a href="/">카스쿼드 홈</a> · <a href="/cars">전체 차종 목록</a></p>
</footer>
</body>
</html>
`;

function carPage(r, all, byBrand) {
  const url = `${SITE}/car/${r.id}`;
  const by = Object.fromEntries(r.attrs.map((a) => [a[0], a]));
  const rec = (k) => (by[k] ? by[k][3] : '');
  const strong = r.attrs.filter((a) => a[2] >= 14).sort((a, b) => b[2] - a[2]).slice(0, 3);
  const weak = r.attrs.filter((a) => a[2] <= 7).sort((a, b) => a[2] - b[2]).slice(0, 2);
  const priceLine = r.og ? `중고 시세 ${won(r.used)}` : `신차 ${won(r.price)}`;
  const noise = rec('quiet'), eff = rec('eff'), accel = rec('accel');
  const descBits = [`OVR ${isNaN(r.ovr) || r.ovr == null ? '–' : r.ovr}`, noise && `실내 소음 ${noise.replace(/\s*\(.*\)$/, '')}`, eff && `연비 ${eff.replace(/\s*\(.*\)$/, '')}`, accel && `제로백 ${accel.replace(/\s*\(.*\)$/, '')}`, priceLine].filter(Boolean);
  const title = `${r.name} 능력치 · 소음 · 연비 · 가격${r.og ? ' (' + r.gyears + ')' : ''} | 카스쿼드`;
  const desc = `${r.name} ${descBits.join(' · ')}. 정숙·성능·효율·공간·안전·가치를 1~20점으로 비교하고 비슷한 값의 경쟁차와 맞대결해 보세요.`.slice(0, 160);
  const nm = r.name;
  const lead = `${nm}${josa(nm, '은', '는')} ${r.brand}의 ${r.pt} ${r.body}${r.og ? `(이전 세대, ${r.gyears})` : ''}${r.og ? '로 중고 시세는 ' + won(r.used) : '로 신차 가격은 ' + won(r.price)}입니다. ` +
    (r.ovr != null && !isNaN(r.ovr) ? `카스쿼드 능력치로 종합 OVR ${r.ovr}점${r.rank ? `(일반 승용차 ${r.rank}위)` : ''}이며, ` : '') +
    (strong.length ? `강점은 ${strong.map((a) => `${a[1]}(${a[2]})`).join(', ')}` : '') + (weak.length ? `, 약점은 ${weak.map((a) => `${a[1]}(${a[2]})`).join(', ')}입니다.` : (strong.length ? '입니다.' : '')) +
    (noise ? ` 80km/h 실내 소음은 ${noise.replace(/\s*\(.*\)$/, '')}` : '') + (eff ? `, 연비는 ${eff.replace(/\s*\(.*\)$/, '')}` : '') + (noise || eff ? '입니다.' : '');
  const rivals = all.filter((x) => x.id !== r.id && x.body === r.body && x.model !== r.model && !x.ex && !x.og && x.price > 0).sort((a, b) => Math.abs(a.price - r.price) - Math.abs(b.price - r.price)).slice(0, 6);
  const sibs = (byBrand[r.brand] || []).filter((x) => x.id !== r.id).slice(0, 10);
  const jsonld = [
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: '카스쿼드', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: '전체 차종', item: SITE + '/cars' },
      { '@type': 'ListItem', position: 3, name: r.brand, item: SITE + '/cars#' + encodeURIComponent(r.brand) },
      { '@type': 'ListItem', position: 4, name: r.name, item: url }] },
    { '@context': 'https://schema.org', '@type': 'Car', name: r.name, brand: { '@type': 'Brand', name: r.brand }, bodyType: r.body, fuelType: r.pt, url }
  ];
  const ovr = r.ovr == null || isNaN(r.ovr) ? '–' : r.ovr;
  return head({ title, desc, url, jsonld }) + `
<nav class="crumb"><a href="/">홈</a> › <a href="/cars">전체 차종</a> › <a href="/cars#${encodeURIComponent(r.brand)}">${esc(r.brand)}</a></nav>
<div class="card">
  <div class="hero">
    <div class="ovr"><b>${ovr}</b><span>OVR${r.rank ? ` · ${r.rank}위` : ''}</span></div>
    <div>
      <h1>${esc(r.name)}</h1>
      <p class="sub">${esc(r.brand)} · ${esc(r.body)} · ${esc(r.pt)}${r.og ? ` · 이전 세대 ${esc(r.gyears)}` : ''}${r.ex ? ' · 슈퍼카·1.5억 이상 리그' : ''}</p>
      <div class="facts"><span>${r.og ? '중고 시세' : '신차'} <b>${won(r.og ? r.used : r.price)}</b></span>${!r.og && r.used ? `<span>중고 시세(3~7만km) <b>${won(r.used)}</b></span>` : ''}<span>차 MBTI <b>${esc(r.mbti)}</b> ${esc(r.mbtiNick)}</span>${r.style && r.style[0] ? `<span>플레이 스타일 <b>${esc(r.style[0])}</b></span>` : ''}</div>
    </div>
  </div>
  <p class="lead">${esc(lead)}</p>
  <div class="cta"><a class="btn gold" href="/#tab=prof&amp;p=${r.id}">소음 듣기 · 트림 옵션 · 연료비 보기</a><a class="btn" href="/#tab=cmp&amp;c=${[r.id].concat(rivals.slice(0, 1).map((x) => x.id)).join(',')}">${rivals[0] ? esc(rivals[0].short) + '와(과) 비교' : '비교하기'}</a></div>
</div>
<div class="card">
  <h2>능력치 그룹</h2>
  <div class="groups">${Object.entries(r.groups).map(([k, v]) => `<div class="g"><span>${k}</span><b class="${cls(v)}">${v == null || isNaN(v) ? '–' : Math.round(v)}</b><div class="bar"><i style="width:${v == null || isNaN(v) ? 0 : Math.round((v / 20) * 100)}%"></i></div></div>`).join('')}</div>
</div>
<div class="card">
  <h2>능력치 상세 (1~20)</h2>
  <table><thead><tr><th>능력치</th><th>점수</th><th>실제 기록</th></tr></thead><tbody>
  ${r.attrs.map((a) => `<tr><td>${esc(a[1])}</td><td class="s ${cls(a[2])}">${a[2]}</td><td>${esc(a[3])}</td></tr>`).join('\n  ')}
  </tbody></table>
  <p class="note">점수는 국내 일반 승용차 안에서의 상대 순위를 1~20으로 바꾼 값입니다. 16 이상 최상급 · 11 이상 준수 · 6 이상 아쉬움 · 5 이하 약점.</p>
</div>
${rivals.length ? `<div class="card"><h2>비슷한 값의 ${esc(r.body)} 경쟁차</h2><ul class="links">${rivals.map((x) => `<li><a href="/car/${x.id}">${esc(x.name)}</a><small>OVR ${x.ovr == null || isNaN(x.ovr) ? '–' : x.ovr} · ${won(x.price)}</small></li>`).join('')}</ul></div>` : ''}
${sibs.length ? `<div class="card"><h2>${esc(r.brand)}의 다른 차</h2><ul class="links">${sibs.map((x) => `<li><a href="/car/${x.id}">${esc(x.name)}</a><small>${x.og ? '이전 세대 ' + esc(x.gyears) : won(x.price)}</small></li>`).join('')}</ul></div>` : ''}
` + FOOT;
}

function listPage(all, byBrand, brands) {
  const url = `${SITE}/cars`;
  const title = '국내 승용차 전체 능력치 목록 — 소음 · 연비 · 가격 | 카스쿼드';
  const desc = `국내 판매 승용차와 이전 세대 ${all.length}종의 정숙·성능·효율·공간·안전·가치 능력치(1~20)와 OVR, 신차 가격·중고 시세를 브랜드별로 정리했습니다.`;
  return head({ title, desc, url }) + `
<nav class="crumb"><a href="/">홈</a> › 전체 차종</nav>
<h1>전체 차종 능력치 목록</h1>
<p class="sub">${all.length}종 · 브랜드별 · OVR은 종합 점수(0~100)</p>
<div class="card"><p class="note" style="margin:0">${brands.map((b) => `<a href="#${encodeURIComponent(b)}">${esc(b)}</a>`).join(' · ')}</p></div>
${brands.map((b) => `<h2 class="brand-h" id="${esc(b)}">${esc(b)} <span class="note">${byBrand[b].length}종</span></h2>
<div class="card"><ul class="links">${byBrand[b].map((x) => `<li><a href="/car/${x.id}">${esc(x.name)}</a><small>OVR ${x.ovr == null || isNaN(x.ovr) ? '–' : x.ovr} · ${x.og ? '이전 세대 ' + esc(x.gyears) : won(x.price)}</small></li>`).join('')}</ul></div>`).join('\n')}
` + FOOT;
}

(async () => {
  const srv = await serve(); const port = srv.address().port;
  const b = await chromium.launch(); const p = await b.newPage();
  await p.route(/wikimedia|ytimg|youtube|google|jsdelivr|script\.google/, (r) => r.abort());
  await p.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'load' }); await p.waitForTimeout(800);
  const all = await p.evaluate(() => window.__carroExport());
  await b.close(); srv.close();
  if (!all || all.length < 100) throw new Error('데이터를 못 읽었어요');
  all.forEach((r) => { if (r.ovr == null) r.ovr = NaN; });
  const byBrand = {};
  all.slice().sort((a, b) => (a.og - b.og) || (isNaN(b.ovr) ? -1 : b.ovr) - (isNaN(a.ovr) ? -1 : a.ovr)).forEach((r) => { (byBrand[r.brand] = byBrand[r.brand] || []).push(r); });
  const order = (o) => all.filter((r) => r.origin === o).map((r) => r.brand);
  const brands = [...new Set(order('국산').concat(all.map((r) => r.brand)))];
  const dir = path.join(ROOT, 'car');
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir);
  all.forEach((r) => fs.writeFileSync(path.join(dir, r.id + '.html'), carPage(r, all, byBrand)));
  fs.writeFileSync(path.join(ROOT, 'seo.css'), CSS.trim() + '\n');
  fs.writeFileSync(path.join(ROOT, 'cars.html'), listPage(all, byBrand, brands));
  const urls = [SITE + '/', SITE + '/cars'].concat(all.map((r) => `${SITE}/car/${r.id}`));
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc><lastmod>${TODAY}</lastmod></url>`).join('\n')}\n</urlset>\n`);
  fs.writeFileSync(path.join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /tools/\n\nSitemap: ${SITE}/sitemap.xml\n`);
  console.log(`차종 페이지 ${all.length}장, 목록 1장, 사이트맵 ${urls.length}개 주소 완료`);
})().catch((e) => { console.error(e); process.exit(1); });
