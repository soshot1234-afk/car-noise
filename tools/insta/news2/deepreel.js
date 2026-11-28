// 신차 집중 분석 릴스 HTML 만들기 (1080×1920). 사용: node deepreel.js 설정.json 출력.html
// 설정: {title:'신차 집중 분석', credit:'사진: OO 제공', end:['한마디 1줄','한마디 2줄(금색)'], scenes:[
//   {type:'cover', img, pos, pill, t1, t2, sub, d},
//   {type:'list', t1, t2, rows:[[이름, 값html, 작은글씨]], note, best:마지막강조여부, d},
//   {type:'keys', img, pos, t1, t2, items:[[라벨, 값html]], note, d},
//   {type:'card', t1, t2, img:'앱카드 png', note, d} ] }  — 이미지 경로는 출력 html 기준
const fs = require('fs');
const cfg = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const CSS = `
@font-face{font-family:J;src:url(../../fonts/yg-jalnan.woff2)}
@font-face{font-family:P;src:url(../../fonts/PretendardVariable.woff2);font-weight:100 900}
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;height:1920px;background:radial-gradient(1300px 900px at 50% -10%,#24304d 0%,#18203a 40%,#111827 75%,#0d1220 100%);color:#fff;font-family:P,sans-serif;position:relative;overflow:hidden;word-break:keep-all}
.bar4{position:absolute;left:0;right:0;top:0;height:16px;background:linear-gradient(90deg,#e2554c 0 25%,#e5a443 25% 50%,#c8d758 50% 75%,#45d37f 75%);transform-origin:left}
.sc{position:absolute;inset:0;display:none}
.ft{position:absolute;left:70px;right:70px;bottom:120px;display:flex;justify-content:space-between;align-items:center}
.ft .br{display:flex;align-items:center;gap:18px;font-size:36px;font-weight:800;letter-spacing:.06em}
.ft img{width:54px;height:54px}.ft .u{font-size:32px;color:#8d93a1;font-weight:600}
/* 인트로 */
#g{position:absolute;left:140px;top:330px;width:800px;height:800px}
.it1{position:absolute;left:0;right:0;top:1170px;text-align:center;font-family:J;font-size:120px;letter-spacing:.04em}
.it2{position:absolute;left:0;right:0;top:1330px;text-align:center}
.it2 span{display:inline-block;font-size:48px;font-weight:800;letter-spacing:.1em;color:#0f1115;background:#e3b448;padding:16px 40px;border-radius:50px}
/* 소식 */
.kk{position:absolute;left:70px;top:150px;font-family:J;font-size:38px;letter-spacing:.12em;color:#e3b448}
.pg{position:absolute;right:70px;top:154px;font-size:36px;font-weight:700;color:#8d93a1}
.tg{position:absolute;left:70px;top:270px;display:flex;align-items:center;gap:24px}
.mk{display:inline-grid;place-items:center;width:110px;height:110px;background:#fff;border-radius:50%}
.mk img{width:64%;height:64%;object-fit:contain}.mk em{font-style:normal;font-weight:900;color:#15181e;font-size:34px}
.tg .t{font-size:40px;font-weight:800;letter-spacing:.06em;color:#0f1115;background:#e3b448;padding:12px 30px;border-radius:40px}
.tg .t.grn{background:#45d37f}
.ti{position:absolute;left:70px;right:60px;top:440px;font-family:J;font-size:104px;line-height:1.18}
.ti div{white-space:nowrap}.ti b{color:#e3b448;font-weight:400}
.rows{position:absolute;left:70px;right:70px;top:760px;display:flex;flex-direction:column;gap:18px}
.r{display:grid;grid-template-columns:200px 1fr;align-items:center;gap:20px;background:#1a2236;border:1px solid #2c3550;border-radius:26px;padding:26px 32px}
.r b{font-size:32px;color:#a9afbb;font-weight:800}
.r span{font-family:J;font-size:46px;line-height:1.25}.r span em{font-style:normal;color:#e3b448}
.r span small{display:block;font-family:P;font-size:28px;color:#8d93a1;font-weight:600;margin-top:6px}
.src{position:absolute;left:70px;right:70px;bottom:230px;font-size:30px;color:#8d93a1;font-weight:600;line-height:1.45}
.src b{color:#c9ced7}
.ph{position:absolute;left:70px;right:70px;top:730px;height:440px;border-radius:30px;overflow:hidden;background:#1a2236}
.ph img{width:100%;height:100%;object-fit:cover}
.ph i{position:absolute;right:16px;bottom:14px;font-style:normal;font-size:24px;font-weight:700;color:#fff;background:rgba(13,18,32,.7);padding:5px 14px;border-radius:12px}
.prog{position:absolute;left:70px;right:70px;top:226px;height:8px;background:#263049;border-radius:4px;overflow:hidden}
.prog i{display:block;height:100%;background:#e3b448}
/* 끝 */
.e1{position:absolute;left:0;right:0;top:580px;text-align:center;font-family:J;font-size:82px;line-height:1.25}
.e1 b{color:#e3b448;font-weight:400}
.dots{position:absolute;left:0;right:0;top:900px;display:flex;justify-content:center;gap:22px}
.dots i{width:36px;height:36px;border-radius:50%}
.elogo{position:absolute;left:0;right:0;top:1040px;display:flex;justify-content:center;align-items:center;gap:22px;font-size:54px;font-weight:800;letter-spacing:.06em}
.elogo img{width:84px;height:84px}
.e2{position:absolute;left:0;right:0;top:1170px;text-align:center;font-size:36px;color:#8d93a1;font-weight:700}
.tm{position:absolute;left:0;right:0;top:1290px;text-align:center;font-size:28px;color:#6b7280;font-weight:600}

.S{position:absolute;inset:0;display:none}
.bg{position:absolute;left:0;right:0;top:0;height:1150px;overflow:hidden}
.bg img{width:100%;height:100%;object-fit:cover;transform-origin:50% 60%}
.bg:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(13,18,32,.6) 0%,rgba(13,18,32,0) 25%,rgba(13,18,32,0) 55%,#0f1525 100%)}
.cr{position:absolute;right:24px;font-size:24px;font-weight:700;color:#fff;background:rgba(13,18,32,.7);padding:5px 14px;border-radius:12px;z-index:3}
.big{position:absolute;left:70px;right:60px;font-family:J;font-size:110px;line-height:1.15}
.big b{color:#e3b448;font-weight:400}
.big{text-shadow:0 4px 24px rgba(0,0,0,.7)}.S .bg:after{background:linear-gradient(180deg,rgba(13,18,32,.85) 0%,rgba(13,18,32,.35) 22%,rgba(13,18,32,0) 40%,rgba(13,18,32,0) 60%,#0f1525 100%)!important}.kp .k{padding:20px 32px}.kp{gap:16px!important}
.bar4{z-index:5}
.sub{position:absolute;left:70px;right:70px;font-size:44px;font-weight:800;color:#c9ced7}
.pill2{display:inline-block;font-size:38px;font-weight:800;letter-spacing:.06em;color:#0f1115;background:#e3b448;padding:10px 28px;border-radius:40px}
.trs{position:absolute;left:70px;right:70px;top:560px;display:flex;flex-direction:column;gap:22px}
.trw{display:flex;justify-content:space-between;align-items:center;background:#1a2236;border:1px solid #2c3550;border-radius:28px;padding:30px 36px}
.trw.best{border:4px solid #e3b448;background:#1f2741}
.trw h5{font-family:J;font-weight:400;font-size:58px}.trw h5 small{display:block;font-family:P;font-size:30px;color:#8d93a1;font-weight:700;margin-top:6px}
.trw .v{font-family:J;font-size:76px;color:#e3b448}.trw .v small{font-family:P;font-size:34px;color:#a9afbb;font-weight:700;margin-left:6px}
.kp{position:absolute;left:70px;right:70px;display:flex;flex-direction:column;gap:20px}
.k{background:rgba(26,34,54,.92);border:1px solid #2c3550;border-radius:28px;padding:26px 34px}
.k b{display:block;font-size:32px;color:#a9afbb;font-weight:800}
.k span{font-family:J;font-size:66px;line-height:1.2}.k span em{font-style:normal;color:#e3b448}.k span small{font-family:P;font-size:30px;color:#8d93a1;font-weight:700;margin-left:8px}
.ovb{position:absolute;left:70px;right:70px;top:440px;display:grid;grid-template-columns:330px 1fr;align-items:center;gap:30px;background:#1f2741;border:4px solid #e3b448;border-radius:34px;padding:30px 36px}
.ovb .o{font-family:J;font-size:190px;line-height:.9;color:#e3b448;text-align:center}.ovb .o small{display:block;font-family:P;font-size:32px;color:#a9afbb;font-weight:800;letter-spacing:.14em;margin-top:8px}
.ovb h5{font-family:J;font-weight:400;font-size:58px;line-height:1.2}.ovb p{font-size:32px;color:#c9ced7;font-weight:700;margin-top:12px;line-height:1.4}
.ats{position:absolute;left:70px;right:70px;top:820px;display:flex;flex-direction:column;gap:12px}
.atr{display:grid;grid-template-columns:230px 1fr 80px;align-items:center;gap:22px;background:#1a2236;border:1px solid #2c3550;border-radius:22px;padding:12px 28px}
.atr b{font-size:36px;font-weight:800}.atr i{display:block;height:20px;border-radius:10px;background:#263049;overflow:hidden}.atr i em{display:block;height:100%;border-radius:10px}
.atr span{font-family:J;font-size:52px;text-align:right}
.nt{position:absolute;left:70px;right:70px;font-size:28px;color:#8d93a1;font-weight:600;line-height:1.45}
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
.cardw{position:absolute;left:0;right:0;top:575px;perspective:1600px}.cardw .fc{transform-origin:50% 50%}
`;
const GAUGE = `// 계기판 게이지 (4색 호 + 눈금 + 바늘)
const A0 = -225, A1 = 45, R = 300;
const pt = (a, r) => [Math.cos(a * Math.PI / 180) * r, Math.sin(a * Math.PI / 180) * r];
const arc = (a, b, r) => { const [x1, y1] = pt(a, r), [x2, y2] = pt(b, r); return \`M\${x1} \${y1} A\${r} \${r} 0 \${b - a > 180 ? 1 : 0} 1 \${x2} \${y2}\`; };
function gauge(p) {
  const cols = ['#45d37f', '#c8d758', '#e5a443', '#e2554c']; const seg = (A1 - A0) / 4; let s = '';
  s += \`<circle r="360" fill="#151d31" stroke="#2c3550" stroke-width="6"/>\`;
  for (let i = 0; i < 4; i++) { const a = A0 + seg * i, b = Math.min(a + seg - 3, A0 + (A1 - A0) * p); if (b > a) s += \`<path d="\${arc(a, b, R)}" stroke="\${cols[i]}" stroke-width="34" fill="none" stroke-linecap="butt"/>\`; }
  for (let i = 0; i <= 40; i++) { const a = A0 + (A1 - A0) * i / 40; const on = i / 40 <= p + 0.001; const big = i % 5 === 0; const [x1, y1] = pt(a, big ? 228 : 246), [x2, y2] = pt(a, 268);
    s += \`<line x1="\${x1}" y1="\${y1}" x2="\${x2}" y2="\${y2}" stroke="\${on ? '#fff' : '#3a4462'}" stroke-width="\${big ? 7 : 3}" stroke-linecap="round"/>\`; }
  for (let i = 0; i <= 8; i++) { const a = A0 + (A1 - A0) * i / 8; const [x, y] = pt(a, 185); s += \`<text x="\${x}" y="\${y + 14}" fill="\${i / 8 <= p + 0.001 ? '#c9ced7' : '#3a4462'}" font-family="P" font-weight="800" font-size="38" text-anchor="middle">\${i * 20}</text>\`; }
  const na = A0 + (A1 - A0) * p; const [nx, ny] = pt(na, 250);
  s += \`<line x1="0" y1="0" x2="\${nx}" y2="\${ny}" stroke="#e3b448" stroke-width="12" stroke-linecap="round"/><circle r="34" fill="#e3b448"/><circle r="14" fill="#151d31"/>\`;
  s += \`<text y="140" fill="#fff" font-family="J" font-size="92" text-anchor="middle">\${Math.round(p * 160)}</text><text y="190" fill="#8d93a1" font-family="P" font-weight="800" font-size="30" text-anchor="middle" letter-spacing="4">km/h</text>\`;
  $('g').innerHTML = s;
}

`;
const sc = cfg.scenes.map((s, i) => {
  const id = 's' + (i + 1); const cr = s.img && s.type !== 'card' ? `<span class="cr" style="top:1050px">${cfg.credit}</span>` : '';
  const bg = s.img && s.type !== 'card' ? `<div class="bg"><img src="${s.img}" style="object-position:${s.pos || '50% 60%'}"></div>${cr}` : '';
  const note = s.note ? `<div class="nt pop" style="top:${s.noteTop || 1600}px">${s.note}</div>` : '';
  if (s.type === 'cover') return `<div class="S" id="${id}">${bg}<div class="sub" style="top:1190px"><span class="pill2">${s.pill || cfg.title}</span></div><div class="big sl" style="top:1300px">${s.t1}<br><b>${s.t2}</b></div><div class="sub sl" style="top:1590px">${s.sub}</div></div>`;
  if (s.type === 'list') return `<div class="S" id="${id}"><div class="big" style="top:200px;font-size:96px">${s.t1}<br><b>${s.t2}</b></div><div class="trs pp">${s.rows.map((r, k) => `<div class="trw${s.best && k === s.rows.length - 1 ? ' best' : ''}"><h5>${r[0]}${r[2] ? `<small>${r[2]}</small>` : ''}</h5><span class="v">${r[1]}</span></div>`).join('')}</div>${note}</div>`;
  if (s.type === 'keys') return `<div class="S" id="${id}">${bg}<div class="big" style="top:150px;font-size:96px">${s.t1}<br><b>${s.t2}</b></div><div class="kp pp" style="top:${s.img ? 1120 : 700}px">${s.items.map((t) => `<div class="k">${t[0] ? `<b>${t[0]}</b>` : ''}<span>${t[1]}</span></div>`).join('')}</div>${note}</div>`;
  if (s.type === 'card') return `<div class="S" id="${id}"><div class="big" style="top:150px;font-size:90px">${s.t1}<br><b>${s.t2}</b></div><div class="cardw" style="position:absolute;left:0;right:0;top:420px"><img class="fc" src="${s.img}" style="display:block;width:960px;margin:0 auto;border-radius:24px;box-shadow:0 30px 80px rgba(0,0,0,.6)"></div>${note}</div>`;
}).join('\n');
const D = JSON.stringify(cfg.scenes.map((s) => [s.type, s.d || 3]));
const html = `<!doctype html><html><head><meta charset="utf-8"><title>${cfg.title} 릴스</title><style>${CSS}
.big{text-shadow:0 4px 24px rgba(0,0,0,.7)}.S .bg:after{background:linear-gradient(180deg,rgba(13,18,32,.85) 0%,rgba(13,18,32,.35) 22%,rgba(13,18,32,0) 40%,rgba(13,18,32,0) 60%,#0f1525 100%)!important}.kp .k{padding:20px 32px}.kp{gap:16px!important}.bar4{z-index:5}</style></head><body>
<div class="bar4" id="bar"></div>
<div class="sc" id="intro"><svg id="g" viewBox="-400 -400 800 800"></svg><div class="it1" id="it1">CAR SQUAD</div><div class="it2" id="it2"><span>${cfg.title}</span></div></div>
${sc}
<div class="sc" id="end"><div class="e1" id="e1">${cfg.end[0]}<br><b>${cfg.end[1]}</b></div>
<div class="dots" id="dots"><i style="background:#e2554c"></i><i style="background:#e5a443"></i><i style="background:#c8d758"></i><i style="background:#45d37f"></i></div>
<div class="elogo" id="elogo"><img src="../logo.svg">CAR SQUAD</div><div class="e2" id="e2">carsquad.kr · 프로필 링크</div><div class="tm" id="tm">제조사 로고는 각 회사의 상표예요 · ${cfg.credit}</div></div>
<div class="ft" id="ft"><span class="br"><img src="../logo.svg">CAR SQUAD</span><span class="u">carsquad.kr</span></div>
<script>
const $ = (i) => document.getElementById(i);
const cl = (x) => Math.max(0, Math.min(1, x));
const eo = (x) => 1 - Math.pow(1 - cl(x), 3);
const eb = (x) => { x = cl(x); const c = 1.6; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
${GAUGE}
const SC = ${D};
const T_IN = 1.5, T_END = 2.0, TOTAL = T_IN + SC.reduce((a, b) => a + b[1], 0) + T_END;
const pop = (els, u, d0, step, dy = 80) => [...els].forEach((e, k) => { const d = d0 + k * step; e.style.opacity = cl((u - d) / 0.18); e.style.transform = 'translateY(' + (1 - eo((u - d) / 0.35)) * dy + 'px) scale(' + (0.94 + 0.06 * eb((u - d) / 0.35)) + ')'; });
const slideIn = (e, u, d, dx = 240) => { e.style.opacity = cl((u - d) / 0.15); e.style.transform = 'translateX(' + (1 - eo((u - d) / 0.35)) * dx + 'px)'; };
function render(t) {
  ['intro', 'end', ...SC.map((s, i) => 's' + (i + 1))].forEach((k) => $(k).style.display = 'none');
  $('bar').style.transform = 'scaleX(' + eo(t / 0.6) + ')'; $('ft').style.opacity = 1;
  if (t < T_IN) {
    $('intro').style.display = 'block'; $('ft').style.opacity = 0;
    gauge(eo(t / 1.0)); const g = $('g'); g.style.transform = 'scale(' + (0.85 + 0.15 * eb(t / 0.5)) + ')'; g.style.opacity = cl(t / 0.25);
    $('it1').style.opacity = cl((t - 0.5) / 0.3); $('it1').style.transform = 'translateY(' + (1 - eo((t - 0.5) / 0.4)) * 60 + 'px)';
    $('it2').style.opacity = cl((t - 0.8) / 0.3); $('it2').style.transform = 'scale(' + (0.6 + 0.4 * eb((t - 0.8) / 0.4)) + ')';
    $('intro').style.opacity = 1 - cl((t - (T_IN - 0.15)) / 0.15); return;
  }
  let lt = t - T_IN;
  for (let i = 0; i < SC.length; i++) { const [ty, d] = SC[i];
    if (lt < d) {
      const s = $('s' + (i + 1)); s.style.display = 'block'; const u = lt; const out = cl((u - (d - 0.18)) / 0.18);
      s.style.opacity = 1 - out; s.style.transform = 'translateX(' + (-out * 120) + 'px)';
      const img = s.querySelector('.bg img'); if (img) img.style.transform = 'scale(' + (1.18 - 0.14 * eo(u / d)) + ')';
      const big = s.querySelector('.big'); if (big) slideIn(big, u, 0.1);
      s.querySelectorAll('.sl').forEach((e, k) => slideIn(e, u, 0.25 + k * 0.25, 160));
      const pp = s.querySelector('.pp'); if (pp) pop(pp.children, u, 0.45, 0.2);
      const fc = s.querySelector('.fc'); if (fc) { const k = eo((u - 0.25) / 0.6); fc.style.transform = 'perspective(1600px) scale(' + (0.7 + 0.3 * eb((u - 0.25) / 0.6)) + ') rotateY(' + (1 - k) * 90 + 'deg)'; fc.style.opacity = cl((u - 0.25) / 0.1); }
      s.querySelectorAll('.nt').forEach((e) => e.style.opacity = cl((u - 1.3) / 0.3));
      if (ty === 'cover') $('ft').style.opacity = 0;
      return;
    }
    lt -= d;
  }
  $('end').style.display = 'block'; $('ft').style.opacity = 0; const u = lt;
  $('e1').style.cssText = 'opacity:' + cl(u / 0.2) + ';transform:scale(' + (0.85 + 0.15 * eb(u / 0.4)) + ')';
  [...$('dots').children].forEach((d, k) => d.style.transform = 'scale(' + eb((u - 0.2 - k * 0.07) / 0.3) + ')');
  $('elogo').style.opacity = cl((u - 0.4) / 0.25); $('e2').style.opacity = cl((u - 0.55) / 0.25); $('tm').style.opacity = cl((u - 0.6) / 0.25);
}
window.TOTAL = TOTAL; window.render = render;
</` + `script></body></html>`;
fs.writeFileSync(process.argv[3], html); console.log('ok', process.argv[3]);
