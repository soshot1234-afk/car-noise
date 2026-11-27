// 판매량 랭킹 인스타 — 공통 레이아웃 (1080×1350, 어두운 톤 + 금색 + 로고 4색 바)
const fs = require('fs'); const path = require('path');
const DIR = __dirname;
const LOGO = fs.readFileSync(path.join(DIR, 'logo.svg'), 'utf8');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const n = (v) => v.toLocaleString('ko-KR');
const LG = { 기아: 'kia.svg', 현대: 'hyundai.svg', 제네시스: 'genesis.png', 르노코리아: 'renault.svg', 쉐보레: 'chevrolet.svg', 테슬라: 'tesla.svg', BMW: 'bmw.svg', 벤츠: 'mercedes.svg', 렉서스: 'lexus.png', 볼보: 'volvo.svg', 아우디: 'audi.svg', 토요타: 'toyota.svg', 포르쉐: 'porsche.svg', 미니: 'mini.svg', 르노: 'renault.svg', 람보르기니: 'lamborghini.svg', 폭스바겐: 'volkswagen.svg' };
const mark = (brand, size) => { const b = String(brand || '').split(' ')[0]; const f = LG[b]; return `<span class="mk" style="width:${size}px;height:${size}px">${f ? `<img src="logos/${f}">` : `<em style="font-size:${Math.round(size * (b.length > 2 ? 0.26 : 0.32))}px">${esc(b)}</em>`}</span>`; };
const C = { R: '#e2554c', O: '#e5a443', L: '#c8d758', G: '#45d37f', GOLD: '#e3b448' };
const CSS = `
@font-face{font-family:J;src:url(../fonts/yg-jalnan.woff2)}
@font-face{font-family:P;src:url(../fonts/PretendardVariable.woff2);font-weight:100 900}
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;height:1350px;background:radial-gradient(1100px 700px at 50% -10%,#24304d 0%,#18203a 40%,#111827 75%,#0d1220 100%);color:#fff;font-family:P,sans-serif;position:relative;overflow:hidden;word-break:keep-all}
.bar4{position:absolute;left:0;right:0;top:0;height:14px;background:linear-gradient(90deg,#e2554c 0 25%,#e5a443 25% 50%,#c8d758 50% 75%,#45d37f 75%)}
.top{position:absolute;left:64px;right:64px;top:62px;display:flex;justify-content:space-between;align-items:center}
.kk{font-family:J;font-size:32px;letter-spacing:.12em;color:#e3b448}
.pg{font-size:30px;font-weight:700;color:#8d93a1}
.ttl{position:absolute;left:64px;right:64px;top:110px;font-family:J;font-size:80px;line-height:1.15}
.ttl b{color:#e3b448;font-weight:400}
.sub{font-size:30px;color:#a9afbb;font-weight:600;margin-top:14px;font-family:P}
.main{position:absolute;left:64px;right:64px;top:300px;bottom:140px;display:flex;flex-direction:column}
.ft{position:absolute;left:64px;right:64px;bottom:46px;display:flex;justify-content:space-between;align-items:center}
.ft .br{display:flex;align-items:center;gap:16px;font-size:30px;font-weight:800;letter-spacing:.06em}
.ft .br svg{width:44px;height:44px}
.ft .u{font-size:28px;color:#8d93a1;font-weight:600}
.src{font-size:23px;color:#7c8291;font-weight:600;line-height:1.5;margin-top:auto}
/* 랭킹 줄 */
.rk{display:flex;flex-direction:column;gap:14px}
.row{display:grid;grid-template-columns:92px 1fr;align-items:center;gap:20px;background:#1a2236;border:1px solid #2c3550;border-radius:24px;padding:20px 30px 22px}
.row.r1{border:3px solid #e3b448;background:#1f2741}
.row .no{font-family:J;font-size:70px;line-height:1;text-align:center;color:#a9afbb}
.row.r1 .no,.row.r2 .no,.row.r3 .no{color:#e3b448}
.row .hd{display:flex;align-items:baseline;justify-content:space-between;gap:12px}
.row h5{font-family:J;font-weight:400;font-size:44px;line-height:1.15}
.row h5 small{font-family:P;font-size:24px;color:#a9afbb;font-weight:700;margin-left:12px}
.row .v{font-family:J;font-size:46px;white-space:nowrap}
.row .v small{font-family:P;font-size:24px;color:#a9afbb;margin-left:4px;font-weight:700}
.row .gb{height:16px;border-radius:9px;background:#263049;margin-top:14px;overflow:hidden}
.row .gb i{display:block;height:100%;border-radius:9px}
.row.sm{padding:12px 26px 14px;border-radius:20px}
.row.sm .no{font-size:52px}
.row.sm h5{font-size:36px}.row.sm .v{font-size:36px}
.row.sm .gb{height:12px;margin-top:9px}
.rk.xs{gap:6px}.rk.xs .row{padding:4px 24px 7px;grid-template-columns:70px 1fr;border-radius:16px}.rk.xs .no{font-size:42px}.rk.xs h5,.rk.xs .v{font-size:32px}.rk.xs .gb{height:9px;margin-top:6px}
.mk{display:inline-grid;place-items:center;flex:none;background:#fff;border-radius:50%;vertical-align:middle;margin-right:16px;box-shadow:0 0 0 2px rgba(255,255,255,.12)}.mk img{width:64%!important;height:64%!important;object-fit:contain;border-radius:0!important;box-shadow:none!important}.mk em{font-style:normal;font-family:P;font-weight:900;color:#15181e;letter-spacing:-.02em}
.row h5{display:flex;align-items:center}
/* 표지 */
.cv{position:absolute;left:64px;right:64px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center}
.pill{display:inline-block;font-size:30px;font-weight:800;letter-spacing:.1em;color:#0f1115;background:#e3b448;padding:12px 28px;border-radius:40px}
.cv h1{font-family:J;font-weight:400;font-size:118px;line-height:1.15;margin-top:46px}
.cv h1 b{color:#e3b448;font-weight:400}
.cv p{font-size:40px;color:#c9ced7;font-weight:700;margin-top:44px;line-height:1.5}
.dots{display:flex;gap:18px;margin-top:60px}
.dots i{width:30px;height:30px;border-radius:50%}
/* 카드 */
.cardwrap{display:flex;flex-direction:column;align-items:center}
.cardwrap img{width:640px;border-radius:40px;box-shadow:0 30px 80px rgba(0,0,0,.45)}
.badge{display:flex;align-items:center;gap:22px;margin-top:-6px;margin-bottom:30px}
.badge .b1{font-family:J;font-size:56px;color:#0f1115;background:#e3b448;border-radius:20px;padding:10px 26px}
.badge .b2{font-family:J;font-size:64px}
.badge .b2 small{font-family:P;font-size:30px;color:#a9afbb;font-weight:700;margin-left:8px}
.end{position:absolute;left:64px;right:64px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center}
.end h2{font-family:J;font-weight:400;font-size:88px;line-height:1.2}
.end p{font-size:38px;color:#c9ced7;font-weight:700;margin-top:40px;line-height:1.55}
.end .lk{margin-top:70px;font-size:32px;color:#8d93a1;font-weight:700}.end .lk b{color:#e3b448}
`;
const dots = () => `<div class="dots">${[C.R, C.O, C.L, C.G].map((c) => `<i style="background:${c}"></i>`).join('')}</div>`;
function page(body, i, total, kick) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body><div class="bar4"></div>
${kick ? `<div class="top"><span class="kk">${kick}</span><span class="pg">${total > 1 ? `${i} / ${total}` : ''}</span></div>` : ''}
${body}
<div class="ft"><span class="br">${LOGO}CAR SQUAD</span><span class="u">carsquad.kr</span></div></body></html>`;
}
// 판매 대수 줄 — 막대 색: 1위 금색, 나머지 로고 4색 순환 대신 초록→노랑 그라데이션
function rows(list, max, start, small) {
  return `<div class="rk">${list.map((r, j) => {
    const k = start + j; const w = Math.max(4, (r.v / max) * 100);
    const color = k === 1 ? C.GOLD : k <= 3 ? C.G : k <= 6 ? C.L : C.O;
    return `<div class="row r${k} ${small ? 'sm' : ''}"><span class="no">${k}</span><div><div class="hd"><h5>${mark(r.brand || r.sub || r.name, small ? 42 : 60)}${esc(r.name)}<small>${esc(r.sub || '')}</small></h5><span class="v">${n(r.v)}<small>대</small></span></div><div class="gb"><i style="width:${w}%;background:${color}"></i></div></div></div>`;
  }).join('')}</div>`;
}
async function render(slides, outDir, browser) {
  fs.mkdirSync(outDir, { recursive: true });
  const p = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  for (let i = 0; i < slides.length; i++) {
    const f = path.join(DIR, '_tmp.html'); fs.writeFileSync(f, slides[i]);
    await p.goto('file://' + f); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(100);
    await p.screenshot({ path: path.join(outDir, String(i + 1).padStart(2, '0') + '.jpg'), type: 'jpeg', quality: 92 });
  }
  await p.close();
}
module.exports = { mark, page, rows, render, dots, esc, n, C, LOGO, CSS };
