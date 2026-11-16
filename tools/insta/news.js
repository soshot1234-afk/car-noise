// 이번 주 차 소식 (뉴스 카드) — 뉴스 담당용 템플릿
// 사용: const { newsPost, render } = require('./news.js'); render(newsPost({...}), '출력폴더')
// 규칙: 카드마다 출처(1차 출처 이름 + 날짜)를 반드시 넣는다. 확인 안 된 숫자는 넣지 않는다.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { pg } = require('./gen4.js');

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const CSSN = `
.nw{display:flex;flex-direction:column;height:100%}
.nw .tag{align-self:flex-start;font-size:26px;font-weight:800;letter-spacing:.08em;color:#0f1115;background:#e3b448;padding:8px 20px;border-radius:30px}
.nw .tag.red{background:#ff6e5a;color:#fff}.nw .tag.grn{background:#45d37f}
.nw h2{font-family:J;font-weight:400;font-size:66px;line-height:1.18;color:#fff;margin:26px 0 10px}
.nw .lead{font-size:31px;color:#c9ced7;font-weight:700;line-height:1.5;margin-bottom:26px}
.nw .box{background:#171e2e;border:1px solid #2c3550;border-radius:26px;padding:10px 34px}
.nw .row{display:grid;grid-template-columns:200px 1fr;gap:20px;align-items:baseline;padding:20px 0;border-bottom:1px solid #263049}
.nw .row:last-child{border-bottom:0}
.nw .row b{font-size:26px;color:#a9afbb;font-weight:800}
.nw .row span{font-size:32px;color:#eef0f4;font-weight:700;line-height:1.4}
.nw .row span em{font-style:normal;color:#e3b448}
.nw .row span small{display:block;font-size:22px;color:#8d93a1;font-weight:600;margin-top:4px}
.nw .one{margin-top:24px;font-size:30px;line-height:1.5;color:#dfe3ea;font-weight:700;background:rgba(227,180,72,.1);border-left:6px solid #e3b448;border-radius:10px;padding:18px 24px}
.nw .src{margin-top:auto;padding-top:18px;font-size:22px;color:#8d93a1;font-weight:600;line-height:1.5}
.nw .src b{color:#c9ced7}
.nc{display:flex;flex-direction:column;justify-content:center;height:100%}
.nc .kk{align-self:flex-start;font-size:30px;font-weight:800;letter-spacing:.12em;color:#0f1115;background:#e3b448;padding:10px 24px;border-radius:40px}
.nc .big{font-family:J;font-weight:400;font-size:104px;line-height:1.12;color:#fff;margin:34px 0 14px}
.nc .dt{font-size:34px;color:#a9afbb;font-weight:700;margin-bottom:46px}
.nc ol{list-style:none;display:flex;flex-direction:column;gap:18px;counter-reset:n}
.nc li{counter-increment:n;display:grid;grid-template-columns:70px 1fr;align-items:center;font-size:36px;font-weight:800;color:#eef0f4;background:#171e2e;border:1px solid #2c3550;border-radius:22px;padding:22px 26px;line-height:1.35}
.nc li:before{content:counter(n);font-family:J;font-weight:400;font-size:54px;color:#e3b448}
.nc .rule{margin-top:40px;font-size:25px;color:#8d93a1;font-weight:600}
`;
const page = (body, i, n) => pg(body, i, n).replace('</style>', CSSN + '</style>');

// items: [{tag, tagCls, title, lead, rows:[[label, html]], one, src}]
function newsPost({ range, items, outro }) {
  const cover = `<div class="nc"><span class="kk">이번 주 차 소식</span><div class="big">놓치면 아까운<br>${items.length}가지</div><div class="dt">${esc(range)}</div>
<ol>${items.map((x) => `<li><span>${esc(x.short || x.title)}</span></li>`).join('')}</ol>
<div class="rule">제조사·정부 발표로 확인된 것만 담았어요</div></div>`;
  const cards = items.map((x) => `<div class="nw"><span class="tag ${x.tagCls || ''}">${esc(x.tag)}</span><h2>${x.title}</h2>${x.lead ? `<div class="lead">${x.lead}</div>` : ''}
<div class="box">${x.rows.map(([k, v]) => `<div class="row"><b>${esc(k)}</b><span>${v}</span></div>`).join('')}</div>
${x.one ? `<div class="one">${x.one}</div>` : ''}<div class="src">${x.src}</div></div>`);
  const end = `<div class="end"><div class="t">${outro.t}</div><div class="s">${outro.s}</div><div class="site">관심 차 능력치·유지비 → <b>프로필 링크</b></div></div>`;
  return [cover, ...cards, end];
}

async function render(slides, outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  for (let i = 0; i < slides.length; i++) {
    const f = path.join(__dirname, '_news_tmp.html'); fs.writeFileSync(f, page(slides[i], i + 1, slides.length));
    await p.goto('file://' + f); await p.evaluate(() => document.fonts.ready);
    const over = await p.evaluate(() => [...document.querySelectorAll('.nw,.nc,.end')].some((e) => e.scrollHeight > e.clientHeight + 2));
    if (over) console.warn('⚠ 내용이 넘침: 슬라이드', i + 1);
    await p.screenshot({ path: path.join(outDir, String(i + 1).padStart(2, '0') + '.jpg'), type: 'jpeg', quality: 92 });
    fs.unlinkSync(f);
  }
  await b.close();
}
module.exports = { newsPost, render };
