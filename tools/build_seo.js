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
    res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream', 'Access-Control-Allow-Origin': '*' }); fs.createReadStream(f).pipe(res);
  });
  return new Promise((ok) => srv.listen(0, '127.0.0.1', () => ok(srv)));
}

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const won = (v) => (v == null || isNaN(v) ? '–' : v >= 10000 ? (v / 10000).toFixed(v % 10000 ? 1 : 0) + '억 원' : Math.round(v).toLocaleString('ko-KR') + '만 원');
const cls = (v) => (isNaN(v) ? 'na' : v >= 16 ? 'hi' : v >= 11 ? 'md' : v >= 6 ? 'lo' : 'bad');
const josa = (w, a, b) => { const c = String(w).trim().slice(-1).charCodeAt(0); if (c < 0xac00 || c > 0xd7a3) { const t = String(w).trim().replace(/[)\]\s]+$/, ''); return /[013678LMNlmnR]$/.test(t) ? a : b; } return (c - 0xac00) % 28 ? a : b; };
const josaRo = (w) => { const c = String(w).trim().slice(-1).charCodeAt(0); if (c < 0xac00 || c > 0xd7a3) return '로'; const j = (c - 0xac00) % 28; return j === 0 || j === 8 ? '로' : '으로'; };
const REC_SRC = '한국교통안전공단 차종별 리콜 자료(공공데이터포털, 2025.12 기준)';
const recTxt = (t) => String(t || '').replace(/^(현대자동차|기아|한국지엠|르노코리아|케이지모빌리티|쌍용자동차)㈜?(\(주\))?에서는\s*/, '').trim();
const LBL = { durab: '무상 점검(리콜)' };
const CUR_Y = Number(TODAY.slice(0, 4));
const REDIRECT = "<script>(function(){var h=location.hostname,p=location.pathname;if(/github\\.io$/.test(h)){p=p.replace(/^\\/car-noise/,'');}else if(!/(^|\\.)carrodor\\.pages\\.dev$/.test(h)){var m=p.match(/^\\/car\\/([\\w-]+)/);if(m&&/[?&]go=1/.test(location.search)){location.replace('/#tab=prof&p='+m[1]);}return;}location.replace('https://carsquad.pages.dev'+p+location.search+location.hash);})();</script>";

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
.start{border-color:#e3b448}
ol.steps{list-style:none;margin:0;padding:0;display:grid;gap:8px;counter-reset:s}
ol.steps li{counter-increment:s}ol.steps a{display:grid;grid-template-columns:30px 1fr;column-gap:10px;align-items:center;padding:10px 12px;border:1px solid var(--line);border-radius:10px;text-decoration:none;color:var(--tx)}
ol.steps a::before{content:counter(s);grid-row:span 2;width:30px;height:30px;border-radius:50%;background:var(--navy);color:var(--gold);display:grid;place-items:center;font-weight:800}
ol.steps b{font-size:15px}ol.steps small{color:var(--mu);font-size:13px}
table.used td,table.used th{white-space:nowrap}table.used td small{color:var(--mu);font-weight:400}
ul.rec{margin:0 0 8px;padding-left:18px;font-size:14.5px}ul.rec time{font-weight:700;margin-right:6px;font-variant-numeric:tabular-nums}
.topics{display:flex;flex-wrap:wrap;gap:8px}.topics a{padding:8px 12px;border:1px solid var(--line);border-radius:20px;background:#fff;text-decoration:none;color:var(--tx);font-size:14px;font-weight:700}
ol.rank{margin:0;padding-left:22px}ol.rank li{padding:6px 0;border-top:1px solid var(--line);font-size:15px}ol.rank li:first-child{border-top:0}ol.rank small{color:var(--mu);margin-left:6px}
.curve{display:grid;grid-template-columns:repeat(9,1fr);gap:6px;align-items:end;height:180px;margin:28px 0 4px}
.curve div{background:linear-gradient(180deg,#45d37f,#c8d758);border-radius:6px 6px 0 0;position:relative}.curve div b{position:absolute;top:-20px;left:0;right:0;text-align:center;font-size:12.5px}
.curvex{display:grid;white-space:nowrap;grid-template-columns:repeat(9,1fr);gap:6px;text-align:center;font-size:12px;color:var(--mu)}
footer{max-width:960px;margin:0 auto;padding:0 16px 40px;font-size:12.5px;color:var(--mu)}
.brand-h{margin:22px 0 8px;font-family:Jalnan,sans-serif;font-weight:400;font-size:20px}
@media (max-width:640px){h1{font-size:25px}.hero{grid-template-columns:1fr}.groups{grid-template-columns:repeat(2,minmax(0,1fr))}.ovr{display:flex;align-items:baseline;gap:10px;justify-content:center}.ovr b{font-size:38px}}
`;

function head({ title, desc, url, jsonld, img }) {
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
<meta property="og:image" content="${img || SITE + '/og.png'}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
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


// ---------------------------------------------------------------- 미리보기 카드 HTML
const GCOL = (v) => (isNaN(v) ? '#596170' : v >= 16 ? '#45d37f' : v >= 11 ? '#c8d758' : v >= 6 ? '#e5a443' : '#e2554c');
function ogHtml(r, port, pt) {
  const G = ['피지컬', '멘탈', '테크닉', '히든', '선수정보'];
  const ovr = r.ovr == null || isNaN(r.ovr) ? '–' : Math.round(r.ovr);
  const ovrCol = GCOL(isNaN(r.ovr) ? NaN : r.ovr / 5);
  const strong = r.attrs.filter((a) => a[2] >= 15 && a[0] !== 'durab').sort((a, b) => b[2] - a[2]).slice(0, 3).map((a) => a[1]);
  const price = r.og ? `중고 ${won(r.used)}` : `신차 ${won(r.price)}`;
  const name = r.name.length > 26 ? r.name.slice(0, 25) + '…' : r.name;
  const fs = name.length > 18 ? 46 : name.length > 12 ? 54 : 62;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:J;src:url(http://127.0.0.1:${port}/fonts/yg-jalnan.woff2)}
${pt ? '@font-face{font-family:P;src:url(http://127.0.0.1:' + port + '/__pt/PretendardVariable.woff2);font-weight:100 900}' : ''}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:#0f1115;color:#f4efe2;font-family:P,"Noto Sans CJK KR",sans-serif;position:relative;overflow:hidden}
.bar{position:absolute;left:0;right:0;bottom:0;height:12px;background:linear-gradient(90deg,#e2554c 0 25%,#e5a443 25% 50%,#c8d758 50% 75%,#45d37f 75%)}
.glow{position:absolute;right:-180px;top:-200px;width:620px;height:620px;border-radius:50%;background:radial-gradient(circle,rgba(227,180,72,.16),transparent 65%)}
.top{position:absolute;left:60px;top:44px;display:flex;align-items:center;gap:14px}
.top img{width:52px;height:52px}.top b{font-family:J;font-weight:400;font-size:30px;letter-spacing:.02em}.top small{display:block;color:#e3b448;font-size:17px;font-weight:600}
.l{position:absolute;left:60px;top:178px;width:560px}
.ovr{display:flex;align-items:flex-end;gap:16px}
.ovr b{font-family:J;font-weight:400;font-size:150px;line-height:.86;color:${ovrCol}}
.ovr span{font-size:26px;font-weight:800;color:#a9afbb;letter-spacing:.12em;padding-bottom:10px}
.nm{margin-top:26px;font-family:J;font-weight:400;font-size:${fs}px;line-height:1.15;color:#fff;word-break:keep-all}
.sub{margin-top:14px;font-size:24px;color:#c9ced7;font-weight:600}
.chips{margin-top:20px;display:flex;gap:10px;flex-wrap:wrap}
.chips span{font-size:21px;font-weight:700;padding:7px 16px;border-radius:30px;background:rgba(69,211,127,.14);color:#7ff0ad;border:1px solid rgba(69,211,127,.4)}
.r{position:absolute;right:60px;top:110px;width:470px;background:#171b23;border:1px solid #2a3140;border-radius:20px;padding:26px 30px}
.r h3{font-size:19px;color:#a9afbb;font-weight:700;letter-spacing:.08em;margin-bottom:10px}
.g{display:grid;grid-template-columns:118px 1fr 54px;align-items:center;gap:14px;height:66px}
.g span{font-size:24px;font-weight:700;color:#e8ebf0}
.g i{display:block;height:16px;border-radius:9px;background:#262c38;position:relative;overflow:hidden}
.g i em{position:absolute;left:0;top:0;bottom:0;border-radius:9px}
.g b{font-family:J;font-weight:400;font-size:32px;text-align:right}
.url{position:absolute;left:60px;bottom:40px;font-size:21px;color:#8d93a1;font-weight:600}
</style></head><body><div class="glow"></div>
<div class="top"><img src="http://127.0.0.1:${port}/favicon.svg"><div><b>CAR SQUAD</b><small>카스쿼드 · 차를 선수처럼</small></div></div>
<div class="l"><div class="ovr"><b>${ovr}</b><span>OVR</span></div>
<div class="nm">${esc(name)}</div>
<div class="sub">${esc([r.pt, r.body, price].filter(Boolean).join(' · '))}</div>
${strong.length ? `<div class="chips">${strong.map((t) => `<span>💪 ${esc(t)}</span>`).join('')}</div>` : ''}</div>
<div class="r"><h3>능력치 (1~20)</h3>${G.map((k) => { const v = r.groups[k]; const ok = v != null && !isNaN(v); return `<div class="g"><span>${k}</span><i><em style="width:${ok ? Math.max(4, v / 20 * 100) : 0}%;background:${GCOL(v)}"></em></i><b style="color:${GCOL(v)}">${ok ? Math.round(v) : '–'}</b></div>`; }).join('')}</div>
<div class="url">carsquad.pages.dev · ${G.n || 760}종 능력치 비교</div><div class="bar"></div></body></html>`;
}

const G = { recId: {}, rec: {}, mp: {} };
const recLine = (t) => { const x = recTxt(t); return /^[^.。]*일부\s*차량[^가-힣]*$/.test(x) || x.length < 8 ? '' : x + '…'; };
function recCard(r) {
  if (r.rec_n == null || r.rec_n === '' || isNaN(r.rec_n)) return '';
  const items = (r.rf && G.rec[r.rf]) || [];
  const rid = r.rf && G.recId[r.rf];
  const n = Number(r.rec_n);
  return `<div class="card"><h2>무상 점검(리콜) 기록</h2>
  <p>${n ? `같은 세대 전체 트림 기준으로 ${r.rec_since ? esc(r.rec_since) + '년부터 ' : ''}무상 점검(리콜) 안내가 <b>${n}번</b> 있었어요${r.rec_units ? ` (대상 ${Number(r.rec_units).toLocaleString('ko-KR')}대)` : ''}.` : '자료 기준으로 아직 무상 점검(리콜) 안내가 없어요.'}</p>
  ${items.length ? `<ul class="rec">${items.slice(0, 3).map(([d, t]) => `<li><time>${esc(d)}</time> ${esc(recLine(t)) || '<span class="note">자세한 내용은 자동차리콜센터에서 확인</span>'}</li>`).join('')}</ul>` : ''}
  <p class="note">무상 점검(리콜)은 제조사가 문제를 찾아 무료로 고쳐 주는 제도라, 횟수만으로 차의 좋고 나쁨을 판단하긴 어려워요. 내 차가 대상인지는 <a href="https://www.car.go.kr" rel="nofollow">자동차리콜센터</a>에서 차량번호로 확인할 수 있어요. 출처: ${REC_SRC}.</p>
  ${rid ? `<p><a class="btn" href="/recall/${rid}">무상 점검(리콜) 전체 기록 보기</a></p>` : ''}</div>`;
}
function usedRows(uy) {
  return (uy || []).filter((u) => u[1] >= 3).sort((a, b) => b[0] - a[0]);
}
function usedCard(r) {
  const rows = usedRows(r.uy); if (rows.length < 2 || r.og) return '';
  const top = rows[0][2];
  return `<div class="card"><h2>몇 년 타면 얼마? 연식별 중고 시세</h2>
  <table class="used"><thead><tr><th>연식</th><th>평균 시세</th><th>최신 연식 대비</th><th>매물</th></tr></thead><tbody>
  ${rows.map(([y, n, p]) => `<tr><td>${y}<small> · ${CUR_Y - y > 0 ? (CUR_Y - y) + '년 차' : '올해'}</small></td><td>${won(p)}</td><td>${Math.round((p / top) * 100)}%</td><td>${n}대</td></tr>`).join('\n  ')}
  </tbody></table>
  <p class="note">같은 세대 전 트림의 엔카 등록 매물 평균이에요. 트림이 섞인 평균이라 주행거리·옵션에 따라 실제 시세는 차이가 커요.${r.depy ? ` 카스쿼드 감가 계산으로는 1년에 평균 ${r.depy}%씩 떨어져요.` : ''} <a href="/guide/how-long">차는 몇 년 타는 게 좋을까?</a></p></div>`;
}
function carPage(r, all, byBrand) {
  const url = `${SITE}/car/${r.id}`;
  const by = Object.fromEntries(r.attrs.map((a) => [a[0], a]));
  const rec = (k) => (by[k] ? by[k][3] : '');
  const strong = r.attrs.filter((a) => a[2] >= 14).sort((a, b) => b[2] - a[2]).slice(0, 3);
  const weak = r.attrs.filter((a) => a[2] <= 7).sort((a, b) => a[2] - b[2]).slice(0, 2);
  const priceLine = r.og ? `중고 시세 ${won(r.used)}` : `신차 ${won(r.price)}`;
  const noise = rec('quiet'), eff = rec('eff'), accel = rec('accel');
  const descBits = [`OVR ${isNaN(r.ovr) || r.ovr == null ? '–' : r.ovr}`, noise && `실내 소음 ${noise.replace(/\s*\(.*\)$/, '')}`, eff && `연비 ${eff.replace(/\s*\(.*\)$/, '')}`, accel && (/제로백/.test(accel) ? accel.replace(/\s*\(.*\)$/, '') : `제로백 ${accel.replace(/\s*\(.*\)$/, '')}`), r.rec_n > 0 && `무상 점검(리콜) ${r.rec_n}회`, priceLine].filter(Boolean);
  const title = `${r.name}${r.og ? ' (' + r.gyears + ')' : ''} 연비·소음·무상 점검(리콜)·중고 시세 | 카스쿼드`;
  const desc = `${r.name} ${descBits.join(' · ')}. 정숙·성능·효율·공간·안전·가치를 1~20점으로 비교하고 비슷한 값의 경쟁차와 맞대결해 보세요.`.slice(0, 160);
  const nm = r.name;
  const lead = `${nm}${josa(nm, '은', '는')} ${r.brand}의 ${r.pt} ${r.body}${r.og ? `(이전 세대, ${r.gyears})` : ''}${josaRo(r.og ? ')' : r.body)}${r.og ? ' 중고 시세는 ' + won(r.used) : ' 신차 가격은 ' + won(r.price)}입니다. ` +
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
  return head({ title, desc, url, jsonld, img: `${SITE}/og/${r.id}.jpg` }) + `
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
  <div class="cta"><a class="btn gold" href="/#tab=prof&amp;p=${r.id}">앱에서 자세히 보기</a></div>
</div>
<div class="card start">
  <h2>처음 오셨다면 이렇게 써 보세요</h2>
  <ol class="steps">
    <li><a href="/#tab=cmp&amp;c=${[r.id].concat(rivals.slice(0, 1).map((x) => x.id)).join(',')}"><b>${rivals[0] ? esc(rivals[0].short) + josa(rivals[0].short, '과', '와') + ' 맞대결' : '다른 차와 맞대결'}</b><small>값이 비슷한 경쟁차와 능력치를 나란히 비교</small></a></li>
    <li><a href="/#tab=prof&amp;p=${r.id}"><b>실내 소음 듣기 · 출퇴근 기름값</b><small>80km/h 실내 소리와 내 거리로 한 달 연료비 계산</small></a></li>
    <li><a href="/#tab=play&amp;g=life"><b>타 봤던 차라면 차생 그래프에 기록</b><small>지금까지 탄 차를 별점으로 이어 그리는 내 차 인생</small></a></li>
  </ol>
</div>
${recCard(r)}
${usedCard(r)}
<div class="card">
  <h2>능력치 그룹</h2>
  <div class="groups">${Object.entries(r.groups).map(([k, v]) => `<div class="g"><span>${k}</span><b class="${cls(v)}">${v == null || isNaN(v) ? '–' : Math.round(v)}</b><div class="bar"><i style="width:${v == null || isNaN(v) ? 0 : Math.round((v / 20) * 100)}%"></i></div></div>`).join('')}</div>
</div>
<div class="card">
  <h2>능력치 상세 (1~20)</h2>
  <table><thead><tr><th>능력치</th><th>점수</th><th>실제 기록</th></tr></thead><tbody>
  ${r.attrs.map((a) => `<tr><td>${esc(LBL[a[0]] || a[1])}</td><td class="s ${cls(a[2])}">${a[2]}</td><td>${esc(a[3])}</td></tr>`).join('\n  ')}
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
<div class="card"><div class="topics">${TOPICS.map(([u, t]) => `<a href="${u}">${esc(t)}</a>`).join('')}</div></div>
<div class="card"><p class="note" style="margin:0">${brands.map((b) => `<a href="#${encodeURIComponent(b)}">${esc(b)}</a>`).join(' · ')}</p></div>
${brands.map((b) => `<h2 class="brand-h" id="${esc(b)}">${esc(b)} <span class="note">${byBrand[b].length}종</span></h2>
<div class="card"><ul class="links">${byBrand[b].map((x) => `<li><a href="/car/${x.id}">${esc(x.name)}</a><small>OVR ${x.ovr == null || isNaN(x.ovr) ? '–' : x.ovr} · ${x.og ? '이전 세대 ' + esc(x.gyears) : won(x.price)}</small></li>`).join('')}</ul></div>`).join('\n')}
` + FOOT;
}


const TOPICS = [
  ['/guide/how-long', '차 몇 년 타야 할까'],
  ['/best/quiet', '조용한 차 순위'],
  ['/best/first-car', '첫차 추천 (3천만 원 이하)'],
  ['/best/efficient', '연비 좋은 차'],
  ['/best/resale', '값 덜 떨어지는 차'],
  ['/recalls', '차종별 무상 점검(리콜) 기록'],
];
const topicNav = (skip) => `<div class="card"><h2>더 알아보기</h2><div class="topics">${TOPICS.filter(([u]) => u !== skip).map(([u, t]) => `<a href="${u}">${esc(t)}</a>`).join('')}<a href="/cars">전체 차종 목록</a></div></div>`;
const crumb = (t) => `<nav class="crumb"><a href="/">홈</a> › ${esc(t)}</nav>`;
const ovrS = (x) => (x.ovr == null || isNaN(x.ovr) ? '–' : x.ovr);
const mkey = (x) => x.model.replace(/\s+(롱레인지|스탠다드|싱글모터|듀얼모터|AWD|\d+kWh|\().*$/, '');
const uniqModel = (arr) => { const seen = new Set(); return arr.filter((x) => (seen.has(mkey(x)) ? false : (seen.add(mkey(x)), true))); };
const itemList = (url, list) => ({ '@context': 'https://schema.org', '@type': 'ItemList', url, itemListElement: list.map((x, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/car/${x.id}`, name: x.name })) });

function recallPage(rf, cars) {
  const r0 = cars[0]; const items = G.rec[rf] || [];
  const nm = r0.model.replace(/^(현대|기아|제네시스|쉐보레|르노|KGM|BMW|벤츠|아우디|폭스바겐|볼보|토요타|렉서스|혼다|포르쉐|테슬라|미니|랜드로버|포드|지프|링컨|캐딜락|푸조|폴스타|BYD)\s+/, '');
  const url = `${SITE}/recall/${G.recId[rf]}`;
  const n = Math.max(...cars.map((x) => Number(x.rec_n) || 0));
  const since = r0.rec_since;
  const title = `${r0.brand} ${nm} 무상 점검(리콜) 기록${since ? ' (' + since + '년~)' : ''} | 카스쿼드`;
  const desc = `${r0.brand} ${nm} 같은 세대 무상 점검(리콜) 안내 ${n}건${items[0] ? ', 최근 ' + items[0][0] : ''}. 날짜별 내용 요약과 내 차 대상 여부 확인 방법을 정리했어요.`;
  return head({ title, desc, url, jsonld: { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: '카스쿼드', item: SITE + '/' }, { '@type': 'ListItem', position: 2, name: '무상 점검(리콜) 기록', item: SITE + '/recalls' }, { '@type': 'ListItem', position: 3, name: `${r0.brand} ${nm}`, item: url }] } }) + `
<nav class="crumb"><a href="/">홈</a> › <a href="/recalls">무상 점검(리콜) 기록</a> › ${esc(r0.brand)}</nav>
<h1>${esc(r0.brand)} ${esc(nm)} 무상 점검(리콜) 기록</h1>
<p class="sub">같은 세대 전체 트림 합산 · ${since ? esc(since) + '년부터 · ' : ''}${n}건${r0.rec_units ? ` · 대상 ${Number(r0.rec_units).toLocaleString('ko-KR')}대` : ''}</p>
<div class="card"><h2>날짜별 안내</h2>
${items.length ? `<ul class="rec">${items.map(([d, t]) => `<li><time>${esc(d)}</time> ${esc(recLine(t)) || '<span class="note">자세한 내용은 자동차리콜센터에서 확인</span>'}</li>`).join('\n')}</ul>` : '<p>날짜별 내용은 아직 정리되지 않았어요.</p>'}
${n > items.length ? `<p class="note">이 밖에 ${n - items.length}건은 자동차리콜센터에서 확인할 수 있어요.</p>` : ''}
<p class="note">내용은 공시 문구의 앞부분만 옮겼어요. 정확한 대상 차량·조치 방법은 원문을 확인해 주세요.</p></div>
<div class="card"><h2>내 차도 대상일까?</h2>
<ol><li><a href="https://www.car.go.kr" rel="nofollow">자동차리콜센터(car.go.kr)</a>에 들어가요.</li><li>리콜 대상 차량 조회에서 차량번호나 차대번호를 넣어요.</li><li>대상이면 가까운 서비스센터에 예약하고 무료로 점검·수리를 받아요.</li></ol>
<p class="note">무상 점검(리콜)은 제조사가 문제를 찾아 무료로 고쳐 주는 제도예요. 횟수가 많다고 무조건 나쁜 차는 아니고, 판매 대수가 많거나 오래 팔린 차일수록 늘어나기 쉬워요. 출처: ${REC_SRC}.</p></div>
<div class="card"><h2>이 세대의 트림</h2><ul class="links">${cars.map((x) => `<li><a href="/car/${x.id}">${esc(x.name)}</a><small>OVR ${ovrS(x)} · ${x.og ? '이전 세대 ' + esc(x.gyears) : won(x.price)}</small></li>`).join('')}</ul></div>
` + topicNav('/recalls') + FOOT;
}

function recallIndex(groups) {
  const url = `${SITE}/recalls`;
  const byB = {}; groups.forEach(([rf, cars]) => { (byB[cars[0].brand] = byB[cars[0].brand] || []).push([rf, cars]); });
  return head({ title: '차종별 무상 점검(리콜) 기록 모음 | 카스쿼드', desc: `국내 판매 승용차 ${groups.length}개 세대의 무상 점검(리콜) 안내 횟수와 날짜별 내용을 제조사별로 정리했어요. 내 차 대상 여부 확인 방법도 함께 안내해요.`, url }) + `
${crumb('무상 점검(리콜) 기록')}
<h1>차종별 무상 점검(리콜) 기록</h1>
<p class="sub">${groups.length}개 세대 · 제조사별 · 출처 ${REC_SRC}</p>
${Object.entries(byB).map(([b, gs]) => `<h2 class="brand-h">${esc(b)}</h2><div class="card"><ul class="links">${gs.map(([rf, cars]) => `<li><a href="/recall/${G.recId[rf]}">${esc(cars[0].model)}</a><small>${Math.max(...cars.map((x) => Number(x.rec_n) || 0))}건${cars[0].rec_since ? ' · ' + esc(cars[0].rec_since) + '년~' : ''}</small></li>`).join('')}</ul></div>`).join('\n')}
` + topicNav('/recalls') + FOOT;
}

function bestPage({ slug, title, h1, desc, intro, list, val, method }) {
  title = title.replace('TOP 20', 'TOP ' + list.length); h1 = h1.replace('TOP 20', 'TOP ' + list.length);
  const url = `${SITE}/best/${slug}`;
  return head({ title: title + ' | 카스쿼드', desc, url, jsonld: itemList(url, list) }) + `
${crumb(h1)}
<h1>${esc(h1)}</h1>
<p class="sub">${esc(intro)}</p>
<div class="card"><ol class="rank">${list.map((x) => `<li><a href="/car/${x.id}">${esc(x.name)}</a><small>${val(x)}</small></li>`).join('\n')}</ol></div>
<div class="card"><h2>이렇게 골랐어요</h2><p class="note" style="font-size:14px">${method}</p>
<div class="cta"><a class="btn gold" href="/#tab=rank">앱에서 순위 바꿔 보기</a><a class="btn" href="/#tab=wiz">5문항으로 나에게 맞는 차 찾기</a></div></div>
` + topicNav('/best/' + slug) + FOOT;
}

function bestPages(all) {
  const pool = all.filter((x) => !x.og && !x.ex && !x.fun);
  const out = {};
  const quiet = uniqModel(pool.filter((x) => x.dba > 0 && /실측/.test(x.noise_src || '') && !/준용/.test(x.noise_src || '') && !/대체|준용/.test(x.noise_note || '')).sort((a, b) => a.dba - b.dba)).slice(0, 20);
  out.quiet = bestPage({ slug: 'quiet', title: '조용한 차 순위 TOP 20 (80km/h 실내 소음 실측)', h1: '조용한 차 순위 TOP 20', desc: `80km/h 실내 소음 실측값이 낮은 국내 판매 신차 20대. 1위 ${quiet[0].name} ${quiet[0].dba}dBA. 소음은 3dB만 낮아도 귀로 꽤 차이가 나요.`, intro: '80km/h로 달릴 때 실내 소음 (dBA, 낮을수록 조용함) · 차종마다 1트림', list: quiet, val: (x) => `${x.dba}dBA · ${won(x.price)}`, method: '오토뷰 로드테스트의 80km/h 실내 소음 실측값이 있는 차만 넣었어요. 다른 트림·이전 모델 측정값을 빌려 온 차와 해외 측정 환산값은 뺐어요. 같은 모델은 가장 조용한 트림 하나만 남겼어요. 노면·타이어·측정일에 따라 1~2dB 차이는 날 수 있어요.' });
  const first = uniqModel(pool.filter((x) => x.price > 0 && x.price <= 3000 && !isNaN(x.ovr)).sort((a, b) => b.ovr - a.ovr)).slice(0, 20);
  out['first-car'] = bestPage({ slug: 'first-car', title: '첫차 추천 — 3천만 원 이하 신차 능력치 TOP 20', h1: '첫차 추천: 3천만 원 이하 TOP 20', desc: `신차 3천만 원 이하 국내 판매 승용차를 능력치 종합 점수(OVR)로 줄 세웠어요. 1위 ${first[0].name}. 연비·안전·소음·유지비까지 한 번에 비교해 보세요.`, intro: '신차 가격 3,000만 원 이하 · 종합 OVR 높은 순 · 차종마다 1트림', list: first, val: (x) => `OVR ${ovrS(x)} · ${won(x.price)}`, method: '카스쿼드 OVR은 정숙·성능·효율·공간·안전·가치 능력치(1~20)를 합친 종합 점수예요. 가격은 수집 시점 기본 트림 기준이라 실제 견적과 다를 수 있어요. 일부 능력치는 공개 자료가 없어 추정값이 섞여 있고, 차 페이지에서 추정 표시를 확인할 수 있어요.' });
  const eff = uniqModel(pool.filter((x) => x.fe > 0 && x.fe_unit === 'km/ℓ').sort((a, b) => b.fe - a.fe)).slice(0, 20);
  out.efficient = bestPage({ slug: 'efficient', title: '연비 좋은 차 순위 TOP 20 (복합 공인연비)', h1: '연비 좋은 차 TOP 20', desc: `복합 공인연비가 높은 국내 판매 신차 20대(전기차 제외). 1위 ${eff[0].name} ${eff[0].fe}km/ℓ.`, intro: '복합 공인연비 (km/ℓ) · 전기차는 단위가 달라 제외 · 차종마다 1트림', list: eff, val: (x) => `${x.fe}km/ℓ · ${won(x.price)}`, method: '한국에너지공단 공인 복합연비 기준이에요. 실제 연비는 운전 습관·계절·도로에 따라 달라요. 내 출퇴근 거리로 한 달 기름값을 보려면 앱에서 차를 열고 출퇴근 연료비를 눌러 보세요.' });
  const res = uniqModel(pool.filter((x) => x.depy > 0 && x.used_n >= 30).sort((a, b) => a.depy - b.depy)).slice(0, 20);
  out.resale = bestPage({ slug: 'resale', title: '값 덜 떨어지는 차 TOP 20 (중고 시세 감가율)', h1: '값 덜 떨어지는 차 TOP 20', desc: `1년에 중고 시세가 덜 떨어지는 국내 판매 차 20대. 1위 ${res[0].name} 연 ${res[0].depy}%.`, intro: '1년 평균 시세 하락률 (낮을수록 값 방어) · 엔카 매물 30대 이상 · 차종마다 1트림', list: res, val: (x) => `연 ${x.depy}% · ${won(x.price)}`, method: '엔카에 등록된 같은 세대 매물의 연식별 시세로 1년 평균 하락률을 계산했어요. 매물이 30대 미만인 차는 뺐어요. 인기 색상·옵션·주행거리에 따라 실제 매입가는 달라요.' });
  return out;
}

function howLongPage(all) {
  const url = `${SITE}/guide/how-long`;
  const ages = {}; const seen = new Set();
  all.forEach((x) => { if (x.og || !x.uy || seen.has(x.model)) return; const m = {}; x.uy.forEach(([y, n, p]) => { if (n >= 8) m[CUR_Y - y] = p; }); if (!m[0]) return; seen.add(x.model); Object.entries(m).forEach(([a, p]) => { a = Number(a); if (a < 1 || a > 8) return; (ages[a] = ages[a] || []).push(p / m[0]); }); });
  const med = (v) => { const s = v.slice().sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
  const rows = Object.keys(ages).map(Number).sort((a, b) => a - b).filter((a) => ages[a].length >= 6).map((a) => [a, Math.round(med(ages[a]) * 100), ages[a].length]); rows.unshift([0, 100, seen.size]);
  const at = (a) => (rows.find((r) => r[0] === a) || [0, '–'])[1];
  const low = uniqModel(all.filter((x) => !x.og && !x.ex && x.depy > 0 && x.used_n >= 30).sort((a, b) => a.depy - b.depy)).slice(0, 8);
  const title = '차 몇 년 타야 할까? 연식별 중고 시세로 본 바꿀 타이밍 | 카스쿼드';
  const desc = `엔카 매물로 보면 올해식 대비 3년 된 차는 ${at(3)}%, 5년 된 차는 ${at(5)}% 시세예요. 값이 가장 많이 빠지는 구간과 하락이 느려지는 시점, 오래 타기 좋은 차를 정리했어요.`;
  return head({ title, desc, url, jsonld: { '@context': 'https://schema.org', '@type': 'Article', headline: '차 몇 년 타야 할까? 연식별 중고 시세로 본 바꿀 타이밍', dateModified: TODAY, author: { '@type': 'Organization', name: '카스쿼드' }, mainEntityOfPage: url } }) + `
${crumb('차 몇 년 타야 할까')}
<h1>차 몇 년 타야 할까?</h1>
<p class="sub">연식별 중고 시세로 본 바꿀 타이밍 · ${TODAY} 기준</p>
<div class="card"><h2>올해식을 100으로 보면, 몇 년 차에 얼마나 남을까</h2>
<div class="curve" style="grid-template-columns:repeat(${rows.length},1fr)">${rows.map((r) => `<div style="height:${r[1]}%"><b>${r[1]}%</b></div>`).join('')}</div>
<div class="curvex" style="grid-template-columns:repeat(${rows.length},1fr)">${rows.map((r) => `<span>${r[0] ? r[0] + '년' : '올해식'}</span>`).join('')}</div>
<p class="note">엔카 매물 연식별 평균 시세 기준 대략값 (${seen.size}개 모델)</p></div>
<div class="card"><h2>오래 타도 값이 덜 떨어지는 차</h2><ol class="rank">${low.map((x) => `<li><a href="/car/${x.id}">${esc(x.name)}</a><small>1년 평균 ${x.depy}% 하락</small></li>`).join('')}</ol><p><a href="/best/resale">TOP 20 전체 보기</a></p></div>
<div class="card start"><h2>내가 탄 차들로 직접 그려 보기</h2><p>지금까지 탄 차를 순서대로 넣고 별점을 매기면, 내 차 인생이 한 장의 그래프가 돼요.</p><div class="cta"><a class="btn gold" href="/#tab=play&amp;g=life">차생 그래프 그려 보기</a></div></div>
` + topicNav('/guide/how-long') + FOOT;
}

function rssFeed(pages) {
  const items = pages.map(([u, t, d, dt]) => `<item><title>${esc(t)}</title><link>${SITE}${u}</link><guid>${SITE}${u}</guid><pubDate>${new Date(dt + 'T00:00:00+09:00').toUTCString()}</pubDate><description>${esc(d)}</description></item>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>카스쿼드</title><link>${SITE}/</link><description>국내 승용차를 선수처럼 비교하는 카스쿼드 — 차종별 능력치·무상 점검(리콜)·중고 시세</description><language>ko</language>\n${items.join('\n')}\n</channel></rss>\n`;
}

(async () => {
  const srv = await serve(); const port = srv.address().port;
  const b = await chromium.launch(); const p = await b.newPage();
  await p.route(/wikimedia|ytimg|youtube|google|jsdelivr|script\.google/, (r) => r.abort());
  await p.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'load' }); await p.waitForTimeout(800);
  const { all, rec } = await p.evaluate(() => { const a = window.__carroExport(); const R = Object.fromEntries((window.__CARS || []).map((r) => [r.id, r])); a.forEach((x) => { const r = R[x.id] || {}; Object.assign(x, { rec_n: r.rec_n, rec_since: r.rec_since, rec_units: r.rec_units, rf: r.rf, uy: r.uy, depy: r.depy, dba: r.dba, noise_src: r.noise_src, noise_note: r.noise_note, fe: r.fe, fe_unit: r.fe_unit, used_n: r.used_n, _e: Object.keys(r._e || {}) }); }); return { all: a, rec: window.__REC || {} }; });
  G.rec = rec; G.n = all.length;
  // 카톡·SNS 미리보기 카드 (og/<id>.jpg, 1200×630)
  if (!process.argv.includes('--no-og')) {
    const ogDir = path.join(ROOT, 'og'); fs.mkdirSync(ogDir, { recursive: true });
    const pg = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
    const PT = process.env.PT_DIR; // (선택) Pretendard 폴더: .../pretendard/dist/web/variable/woff2
    if (PT) await pg.route('**/__pt/**', (rt) => rt.fulfill({ path: path.join(PT, path.basename(new URL(rt.request().url()).pathname)) }));
    let n = 0;
    for (const r of all) {
      await pg.setContent(ogHtml(r, port, !!PT), { waitUntil: 'load' });
      await pg.evaluate(() => document.fonts.ready);
      await pg.screenshot({ path: path.join(ogDir, r.id + '.jpg'), type: 'jpeg', quality: 80 });
      if (++n % 100 === 0) console.log(`미리보기 카드 ${n}장…`);
    }
  }
  await b.close(); srv.close();
  if (!all || all.length < 100) throw new Error('데이터를 못 읽었어요');
  all.forEach((r) => { if (r.ovr == null) r.ovr = NaN; });
  const byBrand = {};
  all.slice().sort((a, b) => (a.og - b.og) || (isNaN(b.ovr) ? -1 : b.ovr) - (isNaN(a.ovr) ? -1 : a.ovr)).forEach((r) => { (byBrand[r.brand] = byBrand[r.brand] || []).push(r); });
  const order = (o) => all.filter((r) => r.origin === o).map((r) => r.brand);
  const brands = [...new Set(order('국산').concat(all.map((r) => r.brand)))];
  const dir = path.join(ROOT, 'car');
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir);
  const mpm = {}; all.forEach((r) => { if (!r.og && r.price > 0) (mpm[r.model] = mpm[r.model] || []).push(r.price); }); Object.entries(mpm).forEach(([k, v]) => { v.sort((a, b) => a - b); G.mp[k] = v[Math.floor((v.length - 1) / 2)]; });
  const groups = {}; all.forEach((r) => { if (r.rf && r.rec_n !== '' && r.rec_n != null && !isNaN(r.rec_n)) (groups[r.rf] = groups[r.rf] || []).push(r); });
  const gl = Object.entries(groups).filter(([rf, cs]) => (rec[rf] || []).length || Math.max(...cs.map((x) => Number(x.rec_n) || 0)) > 0);
  gl.forEach(([rf, cs]) => { cs.sort((a, b) => a.og - b.og || a.price - b.price); G.recId[rf] = cs.map((x) => x.id).sort()[0]; });
  const brandOrder = (b) => { const i = brands.indexOf(b); return i < 0 ? 99 : i; };
  gl.sort((a, b) => brandOrder(a[1][0].brand) - brandOrder(b[1][0].brand) || a[1][0].model.localeCompare(b[1][0].model, 'ko'));
  all.forEach((r) => fs.writeFileSync(path.join(dir, r.id + '.html'), carPage(r, all, byBrand)));
  const rdir = path.join(ROOT, 'recall'); fs.rmSync(rdir, { recursive: true, force: true }); fs.mkdirSync(rdir);
  gl.forEach(([rf, cs]) => fs.writeFileSync(path.join(rdir, G.recId[rf] + '.html'), recallPage(rf, cs)));
  fs.writeFileSync(path.join(ROOT, 'recalls.html'), recallIndex(gl));
  const bdir = path.join(ROOT, 'best'); fs.rmSync(bdir, { recursive: true, force: true }); fs.mkdirSync(bdir);
  const bp = bestPages(all); Object.entries(bp).forEach(([k, h]) => fs.writeFileSync(path.join(bdir, k + '.html'), h));
  const gdir = path.join(ROOT, 'guide'); fs.mkdirSync(gdir, { recursive: true });
  fs.writeFileSync(path.join(gdir, 'how-long.html'), howLongPage(all));
  const feed = [['/guide/how-long', '차 몇 년 타야 할까? 연식별 중고 시세로 본 바꿀 타이밍', '엔카 매물 연식별 시세로 본 값이 많이 빠지는 구간과 하락이 느려지는 시점', TODAY]]
    .concat([['quiet', '조용한 차 순위 TOP 20'], ['first-car', '첫차 추천: 3천만 원 이하'], ['efficient', '연비 좋은 차 TOP 20'], ['resale', '값 덜 떨어지는 차 TOP 20']].map(([k, t]) => ['/best/' + k, t, t + ' — 카스쿼드 데이터로 정리', TODAY]))
    .concat(gl.map(([rf, cs]) => [rf, cs, (rec[rf] || [])[0]]).filter((x) => x[2]).sort((a, b) => (a[2][0] < b[2][0] ? 1 : -1)).slice(0, 15).map(([rf, cs, it]) => ['/recall/' + G.recId[rf], `${cs[0].model} 무상 점검(리콜) 기록`, `최근 안내 ${it[0]} · 같은 세대 ${Math.max(...cs.map((x) => Number(x.rec_n) || 0))}건`, it[0]]));
  fs.writeFileSync(path.join(ROOT, 'rss.xml'), rssFeed(feed));
  fs.writeFileSync(path.join(ROOT, 'seo.css'), CSS.trim() + '\n');
  fs.writeFileSync(path.join(ROOT, 'cars.html'), listPage(all, byBrand, brands));
  const urls = [SITE + '/', SITE + '/cars', SITE + '/recalls', SITE + '/guide/how-long'].concat(Object.keys(bp).map((k) => `${SITE}/best/${k}`), gl.map(([rf]) => `${SITE}/recall/${G.recId[rf]}`), all.map((r) => `${SITE}/car/${r.id}`));
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc><lastmod>${TODAY}</lastmod></url>`).join('\n')}\n</urlset>\n`);
  fs.writeFileSync(path.join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /tools/\n\nSitemap: ${SITE}/sitemap.xml\n`);
  console.log(`차종 페이지 ${all.length}장, 무상 점검(리콜) ${gl.length}장, 주제 ${Object.keys(bp).length + 1}장, 목록 2장, 사이트맵 ${urls.length}개 주소 완료`);
})().catch((e) => { console.error(e); process.exit(1); });
