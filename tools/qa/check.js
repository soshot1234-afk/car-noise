// 카스쿼드 화면 검수 (매주 개발 담당이 돌림)
// 사용법:  cd car-noise && (python3 -m http.server 8765 &) && node tools/qa/check.js [차id ...]
// - 폰 좁은 폭(320=갤럭시 플립·큰 글씨 설정, 360, 375, 390, 412), 태블릿 768, PC 1280에서
// - 선수 화면의 접힌/미리보기 섹션을 전부 펼친 뒤
// - ① 가로로 화면 밖으로 넘친 글자 ② 한 줄에 한두 글자씩 찌그러진 글자 ③ 페이지 가로 스크롤 ④ 스크립트 오류를 찾음
// 문제가 하나라도 있으면 종료 코드 1
const { chromium } = require('playwright');
const BASE = process.env.QA_BASE || 'http://localhost:8765/';
const WIDTHS = [320, 360, 375, 390, 412, 768, 1280];
const CARS = process.argv.slice(2).length ? process.argv.slice(2) : ['dom54', 'dom69', 'dom21', 'oth95', 'leg1'];
const TABS = ['home', 'rank', 'play', 'sq', 'wiz', 'cmp', 'fun', 'used', 'all', 'how'];

const scan = (root) => {
  const out = []; const W = document.documentElement.clientWidth;
  if (document.documentElement.scrollWidth > W + 2) out.push('PAGE-HSCROLL ' + document.documentElement.scrollWidth + '>' + W);
  document.querySelectorAll(root + ' *').forEach((e) => {
    if (!e.offsetParent || e.childElementCount) return;
    let a = e.parentElement, sc = false;
    while (a) { const ox = getComputedStyle(a).overflowX; if (ox === 'auto' || ox === 'scroll') { sc = true; break; } a = a.parentElement; }
    if (sc) return;
    const t = e.textContent.trim(); if (t.length < 6) return;
    const r = e.getBoundingClientRect(); const fs = parseFloat(getComputedStyle(e).fontSize);
    if (r.width < fs * 3.2 && r.height / (fs * 1.25) > 3) out.push('SQUEEZE ' + (e.className || e.tagName) + ' w' + Math.round(r.width) + ' "' + t.slice(0, 20) + '"');
    if (r.right > W + 2) out.push('OVERFLOW ' + (e.className || e.tagName) + ' right' + Math.round(r.right) + ' "' + t.slice(0, 20) + '"');
  });
  return [...new Set(out)].slice(0, 10);
};

(async () => {
  const b = await chromium.launch(); let fail = 0;
  const run = async (w, hash, root) => {
    const mob = w < 768;
    const p = await b.newPage({ viewport: { width: w, height: 900 }, isMobile: mob, hasTouch: mob });
    await p.route(/wikimedia|wikipedia|googlevideo|ytimg|youtube|doubleclick/, (r) => r.abort());
    const errs = []; p.on('pageerror', (e) => errs.push('JS-ERROR ' + e.message.slice(0, 80)));
    await p.goto(BASE + hash); await p.waitForTimeout(1500);
    await p.evaluate(() => { document.querySelectorAll('details').forEach((d) => (d.open = true)); document.querySelectorAll('.psec.peek').forEach((d) => { d.classList.remove('peek'); d.classList.add('full'); }); });
    await p.waitForTimeout(700);
    const bad = (await p.evaluate(scan, root)).concat(errs);
    if (bad.length) { fail++; console.log(`✗ ${w}px ${hash}\n    ` + bad.join('\n    ')); }
    await p.close();
  };
  for (const w of WIDTHS) {
    for (const c of CARS) await run(w, '#tab=prof&p=' + c, '#p-prof');
    for (const t of TABS) await run(w, '#tab=' + t, '#p-' + t);
  }
  console.log(fail ? `\n문제 ${fail}건` : `✓ 전부 통과 (${WIDTHS.length}개 폭 × ${CARS.length + TABS.length}개 화면)`);
  await b.close(); process.exit(fail ? 1 : 0);
})();
