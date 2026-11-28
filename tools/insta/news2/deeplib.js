// 신차 집중 분석 공통 도구 (게시물 1080×1350). 예: 2026-11-28-vistiq.js
// deepPost({ dir:'photos/날짜/차', credit:'사진: OO 제공', slides:[...] }) → 렌더 함수
// slide 종류: 함수(H) => html 문자열, 또는 'APPCARD:경로'(앱 선수 카드 png를 그대로 한 장으로)
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const L = require('./lib.js');
const X = `
.hero{position:absolute;left:0;right:0;top:0;height:820px;overflow:hidden}
.hero img{width:100%;height:100%;object-fit:cover}
.hero:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(13,18,32,.55) 0%,rgba(13,18,32,0) 30%,rgba(13,18,32,0) 55%,#111827 100%)}
.cr{position:absolute;right:20px;z-index:2;font-size:20px;font-weight:700;color:#fff;background:rgba(13,18,32,.7);padding:4px 12px;border-radius:12px}
.ph{position:relative;border-radius:26px;overflow:hidden;background:#1a2236;flex:none}
.ph img{width:100%;height:100%;object-fit:cover}
.ph .cr{bottom:12px}
.nrow{display:grid;grid-template-columns:190px 1fr;align-items:center;gap:18px;background:#1a2236;border:1px solid #2c3550;border-radius:20px;padding:14px 26px}
.nrow b{font-size:26px;color:#a9afbb;font-weight:800}
.nrow span{font-family:J;font-size:34px;line-height:1.25}
.nrow span em{font-style:normal;color:#e3b448}
.nrow span small{display:block;font-family:P;font-size:22px;color:#8d93a1;font-weight:600;margin-top:4px;line-height:1.35}
.col{display:flex;flex-direction:column;gap:10px}
.tr{display:grid;grid-template-columns:1fr auto;align-items:center;background:#1a2236;border:1px solid #2c3550;border-radius:22px;padding:18px 28px}
.tr.best{border:3px solid #e3b448;background:#1f2741}
.tr h5{font-family:J;font-weight:400;font-size:42px}
.tr h5 small{display:block;font-family:P;font-size:23px;color:#8d93a1;font-weight:700;margin-top:6px}
.tr .v{font-family:J;font-size:50px;color:#e3b448}
.tr .v small{font-family:P;font-size:26px;color:#a9afbb;margin-left:4px;font-weight:700}
.add{background:#1a2236;border:1px solid #2c3550;border-radius:22px;padding:16px 26px}
.add h6{font-family:J;font-weight:400;font-size:34px;color:#e3b448;margin-bottom:6px}
.add h6 small{font-family:P;font-size:22px;color:#8d93a1;font-weight:700;margin-left:10px}
.add p{font-size:25px;line-height:1.45;color:#dfe3ea;font-weight:700}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.sp{background:#1a2236;border:1px solid #2c3550;border-radius:20px;padding:14px 22px}
.sp b{display:block;font-size:22px;color:#8d93a1;font-weight:800}
.sp span{font-family:J;font-size:36px}.sp span small{font-family:P;font-size:22px;color:#a9afbb;font-weight:700;margin-left:4px}
.chip{display:flex;flex-wrap:wrap;gap:12px}
.chip i{font-style:normal;display:flex;align-items:center;gap:10px;font-size:25px;font-weight:800;background:#1a2236;border:1px solid #2c3550;border-radius:30px;padding:10px 20px 10px 12px}
.chip i u{width:30px;height:30px;border-radius:50%;border:2px solid rgba(255,255,255,.35)}
.sec{font-size:24px;color:#e3b448;font-weight:800;letter-spacing:.08em;margin:6px 0 2px}
.one{font-size:28px;line-height:1.5;color:#fff;font-weight:800;background:rgba(227,180,72,.12);border:2px solid #e3b448;border-radius:22px;padding:16px 24px}
.note{font-size:22px;color:#8d93a1;font-weight:600;line-height:1.45}
.src b{color:#c9ced7}
.ovr{display:grid;grid-template-columns:260px 1fr;gap:24px;align-items:center;background:#1f2741;border:3px solid #e3b448;border-radius:28px;padding:18px 28px}
.ovr .o{font-family:J;font-size:120px;line-height:.9;color:#e3b448;text-align:center}
.ovr .o small{display:block;font-family:P;font-size:24px;color:#a9afbb;font-weight:800;letter-spacing:.14em;margin-top:8px}
.ovr h5{font-family:J;font-weight:400;font-size:44px;line-height:1.2}
.ovr p{font-size:25px;color:#c9ced7;font-weight:700;margin-top:10px;line-height:1.45}
.atg{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.at{display:grid;grid-template-columns:1fr 64px;grid-template-rows:auto auto;column-gap:12px;row-gap:8px;align-items:center;background:#1a2236;border:1px solid #2c3550;border-radius:18px;padding:12px 20px}
.at b{grid-column:1;grid-row:1;white-space:nowrap}.at span{grid-column:2!important;grid-row:1}.at i{grid-column:1 / 3;grid-row:2}.at:last-child{grid-column:1 / 3}
.at b{font-size:27px;font-weight:800}
.at b small{font-size:20px;color:#8d93a1;font-weight:700;margin-left:10px}
.at i{display:block;height:14px;border-radius:9px;background:#263049;overflow:hidden}.at i em{display:block;height:100%;border-radius:9px}
.at span{font-family:J;font-size:40px;text-align:right;grid-row:1}
.fc{position:relative;width:640px;height:900px;margin:0 auto;clip-path:polygon(50% 0,100% 4%,100% 90%,50% 100%,0 90%,0 4%);background:linear-gradient(160deg,#f7e3a1 0%,#e3b448 38%,#b8862a 70%,#e9c46a 100%)}
.fc .in{position:absolute;inset:12px;clip-path:polygon(50% 0,100% 4%,100% 90%,50% 100%,0 90%,0 4%);overflow:hidden;background:linear-gradient(160deg,#1f2741 0%,#131a2b 100%)}
.fc .pic{position:absolute;left:0;right:0;top:24px;height:360px}
.fc .pic img{width:100%;height:100%;object-fit:cover;object-position:62% 72%}
.fc .pic:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(19,26,43,.8) 0%,rgba(19,26,43,0) 38%,rgba(19,26,43,0) 60%,#18203a 100%)}
.fc .ov{position:absolute;left:40px;top:50px;z-index:2;text-align:center;text-shadow:0 3px 14px rgba(0,0,0,.7)}
.fc .ov b{display:block;font-family:J;font-weight:400;font-size:118px;line-height:.9;color:#f3d27a}
.fc .ov small{display:block;font-size:24px;font-weight:900;letter-spacing:.14em;color:#fff;margin-top:6px}
.fc .ov i{display:block;font-style:normal;font-size:21px;font-weight:800;color:#e9edf3;margin-top:12px}
.fc .ov .lg{display:inline-grid;place-items:center;width:58px;height:58px;border-radius:50%;background:#fff;margin-top:12px;font-size:17px;font-weight:900;color:#15181e;text-shadow:none}
.fc .nm{position:absolute;left:0;right:0;top:362px;text-align:center}
.fc .nm h4{font-family:J;font-weight:400;font-size:54px;color:#fff;line-height:1.1}
.fc .nm p{font-size:25px;font-weight:800;color:#e3b448;margin-top:8px}
.fc .ln{position:absolute;left:70px;right:70px;top:478px;height:2px;background:linear-gradient(90deg,transparent,#e3b448,transparent)}
.fc .st{position:absolute;left:80px;right:80px;top:494px;display:grid;grid-template-columns:1fr 2px 1fr;column-gap:26px}
.fc .st .sep{background:linear-gradient(180deg,transparent,#e3b448,transparent)}
.fc .st ul{list-style:none;display:flex;flex-direction:column;gap:0}
.fc .st li{display:flex;align-items:baseline;gap:14px;font-size:27px;font-weight:800;color:#dfe3ea}
.fc .st li b{font-family:J;font-weight:400;font-size:44px;min-width:58px;text-align:right}
.fc .bt{position:absolute;left:0;right:0;top:812px;text-align:center;font-size:19px;font-weight:800;letter-spacing:.2em;color:#e3b448}
.tm{font-size:22px;color:#6b7280;font-weight:600;margin-top:34px}
`;
const K = '신차 집중 분석';
function helpers(dir, CR) {
  const PH = (n) => `${dir}/${n}.jpg`;
  return {
    PH, CR, K, mark: L.mark, dots: L.dots,
    ttl: (t, top = 110, fs = 72) => `<div class="ttl" style="top:${top}px;font-size:${fs}px">${t}</div>`,
    main: (inner, top = 330) => `<div class="main" style="top:${top}px;bottom:120px;gap:12px">${inner}</div>`,
    photo: (n, h, pos = '50% 50%') => `<div class="ph" style="height:${h}px"><img src="${PH(n)}" style="object-position:${pos}"><span class="cr">${CR}</span></div>`,
    row: (k, v) => `<div class="nrow"><b>${k}</b><span>${v}</span></div>`,
    hero: (n, pos, brand, t1, t2, sub) => `<div class="hero"><img src="${PH(n)}" style="object-position:${pos || '50% 60%'}"></div><span class="cr" style="top:780px">${CR}</span>
   <div style="position:absolute;left:64px;right:64px;top:850px"><div style="display:flex;align-items:center;gap:18px">${L.mark(brand, 70)}<span class="pill" style="font-size:28px;padding:10px 24px">${K}</span></div>
   <h1 style="font-family:J;font-weight:400;font-size:88px;line-height:1.15;margin-top:22px">${t1}<br><b style="color:#e3b448;font-weight:400">${t2}</b></h1>
   <p style="font-size:32px;color:#c9ced7;font-weight:700;margin-top:16px">${sub}</p></div>`,
    end: (t1, t2, s) => `<div class="end"><h2>${t1}<br><b style="color:#e3b448;font-weight:400">${t2}</b></h2><p>${s}</p>${L.dots()}<div class="lk">관심 차 능력치 카드 → <b>프로필 링크</b></div><div class="tm">제조사 로고는 각 회사의 상표예요 · 정보 구분용<br>${CR} 보도용 이미지</div></div>`,
  };
}
async function renderDeep(slides, out) {
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  for (let i = 0; i < slides.length; i++) {
    const fn = path.join(out, String(i + 1).padStart(2, '0') + '.jpg');
    if (slides[i].startsWith('APPCARD:')) { await p.goto('file://' + path.join(__dirname, slides[i].slice(8))); await p.screenshot({ path: fn, type: 'jpeg', quality: 92 }); continue; }
    const html = L.page(slides[i], i + 1, slides.length, i ? K : '').replace('</style>', X + '</style>');
    const f = path.join(__dirname, '_deep_tmp.html'); fs.writeFileSync(f, html);
    await p.goto('file://' + f); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(150);
    const over = await p.evaluate(() => { const m = document.querySelector('.main'); const ft = document.querySelector('.ft'); if (!m) return false; const s = document.querySelector('.src'); return (s && s.getBoundingClientRect().bottom > ft.getBoundingClientRect().top - 8) || m.scrollHeight > m.clientHeight + 2; });
    if (over) console.warn('⚠ 내용이 넘침: 슬라이드', i + 1);
    await p.screenshot({ path: fn, type: 'jpeg', quality: 92 }); fs.unlinkSync(f);
  }
  await b.close();
}
module.exports = { helpers, renderDeep, K };
