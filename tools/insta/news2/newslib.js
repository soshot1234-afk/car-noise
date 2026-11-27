// 이번 주 차 소식 — 판매량 랭킹 스타일(1080×1350) 뉴스 템플릿
// 사용: const { newsPost, renderNews } = require('../newslib.js'); renderNews(newsPost({...}), '출력폴더')
// 규칙: 카드마다 1차 출처(이름+날짜). 확인 안 된 숫자·추정치 금지. 리콜은 '무상 점검(리콜)'. 차 사진 금지, 로고는 흰 원 마크만.
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const L = require('./lib.js'); const { mark, dots, esc } = L;
const NCSS = `
.nrow{display:grid;grid-template-columns:200px 1fr;align-items:center;gap:20px;background:#1a2236;border:1px solid #2c3550;border-radius:22px;padding:18px 28px}
.nrow b{font-size:27px;color:#a9afbb;font-weight:800}
.nrow span{font-family:J;font-size:38px;line-height:1.25}
.nrow span em{font-style:normal;color:#e3b448}
.nrow span small{display:block;font-family:P;font-size:23px;color:#8d93a1;font-weight:600;margin-top:6px;line-height:1.35}
.ntag{display:flex;align-items:center;gap:18px;margin-bottom:22px}
.ntag .t{font-size:28px;font-weight:800;letter-spacing:.08em;color:#0f1115;background:#e3b448;padding:8px 22px;border-radius:30px}
.ntag .t.red{background:#e2554c;color:#fff}.ntag .t.grn{background:#45d37f}
.lead{font-size:31px;color:#c9ced7;font-weight:700;line-height:1.5;margin-bottom:24px}
.one{margin-top:20px;font-size:30px;line-height:1.5;color:#fff;font-weight:800;background:rgba(227,180,72,.12);border:2px solid #e3b448;border-radius:22px;padding:18px 26px}
.src b{color:#c9ced7}
.tm{font-size:22px;color:#6b7280;font-weight:600;margin-top:34px}
`;
const pageN = (body, i, total, kick) => L.page(body, i, total, kick).replace('</style>', NCSS + '</style>');
// items: [{brand, tag, tagCls, short, title(<b> 금색 가능), lead, rows:[[label, html]], one, src}]
function newsPost({ range, items, outro }) {
  const total = items.length + 2;
  const many = items.length > 4; // 5개 이상이면 표지 간격을 줄여 아래 로고와 겹치지 않게
  const cover = `<div class="cv" style="justify-content:flex-start;padding-top:${many ? 130 : 190}px"><span class="pill">이번 주 차 소식</span><h1 style="font-size:${many ? 92 : 104}px;margin-top:${many ? 28 : 36}px">놓치면 아까운<br><b>${items.length}가지</b></h1><p style="margin-top:22px;font-size:34px;color:#a9afbb">${esc(range)}</p>
<div class="rk" style="width:100%;margin-top:${many ? 34 : 50}px;text-align:left${many ? ';gap:10px' : ''}">${items.map((x, j) => `<div class="row r1" style="padding:${many ? '12px 30px' : '22px 30px'}"><span class="no">${j + 1}</span><h5 style="font-size:38px">${mark(x.brand, 60)}${esc(x.short)}</h5></div>`).join('')}</div>
<div class="note" style="margin-top:${many ? 22 : 30}px;font-size:25px;color:#8d93a1;font-weight:600">제조사·정부 발표로 확인된 것만 담았어요</div></div>`;
  const cards = items.map((x) => `<div class="ttl" style="font-size:76px;top:120px"><div class="ntag">${mark(x.brand, 70)}<span class="t ${x.tagCls || ''}">${esc(x.tag)}</span></div>${x.title}</div>
<div class="main" style="top:420px;bottom:120px">${x.lead ? `<div class="lead">${x.lead}</div>` : ''}<div class="cmp" style="display:flex;flex-direction:column;gap:12px">${x.rows.map(([k, v]) => `<div class="nrow"><b>${esc(k)}</b><span>${v}</span></div>`).join('')}</div>
${x.one ? `<div class="one">${x.one}</div>` : ''}<div class="src">${x.src}</div></div>`);
  const end = `<div class="end"><h2>${outro.t}</h2><p>${outro.s}</p>${dots()}<div class="lk">관심 차 능력치 카드 → <b>프로필 링크</b></div><div class="tm">제조사 로고는 각 회사의 상표예요 · 정보 구분용</div></div>`;
  return [cover, ...cards, end].map((b, i) => pageN(b, i + 1, total, i ? '이번 주 차 소식' : ''));
}
async function renderNews(slides, outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  for (let i = 0; i < slides.length; i++) {
    const f = path.join(__dirname, '_news_tmp.html'); fs.writeFileSync(f, slides[i]);
    await p.goto('file://' + f); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(100);
    const over = await p.evaluate(() => { const m = document.querySelector('.main'); const ft = document.querySelector('.ft'); if (!m) return false; const s = document.querySelector('.src'); return (s && s.getBoundingClientRect().bottom > ft.getBoundingClientRect().top - 8) || m.scrollHeight > m.clientHeight + 2; });
    if (over) console.warn('⚠ 내용이 넘침: 슬라이드', i + 1);
    await p.screenshot({ path: path.join(outDir, String(i + 1).padStart(2, '0') + '.jpg'), type: 'jpeg', quality: 92 });
    fs.unlinkSync(f);
  }
  await b.close();
}
module.exports = { newsPost, renderNews };
