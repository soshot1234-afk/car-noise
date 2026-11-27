// 카스쿼드 화면 검수 (매주 개발 담당이 돌림)
// 사용법:  cd car-noise && (python3 -m http.server 8765 &) && node tools/qa/check.js [차id ... | '#tab=...' ...]
//   인수: 차 id(dom54 등)는 선수 화면, '#tab=play&g=mb'처럼 #으로 시작하면 그 화면을 추가로 검사
//   진짜 글꼴로 보려면 한 번: npm i --no-save --prefix tools/qa pretendard@1.3.9 @fontsource/barlow-condensed@5 (tools/qa/fonts.js)
// - 폰 좁은 폭(320=갤럭시 플립·큰 글씨 설정, 360, 375, 390, 412), 태블릿 768, PC 1280에서
// - 선수 화면의 접힌/미리보기 섹션을 전부 펼친 뒤
// - ① 가로로 화면 밖으로 넘친 글자 ② 한 줄에 한두 글자씩 찌그러진 글자 ③ 페이지 가로 스크롤 ④ 스크립트 오류
//   ⑤ 짧은 글(제목·라벨, 12자 이하)에서 낱말 중간이 쪼개져 줄이 바뀐 것(예: '정/숙', '판박이 콤/비')을 찾음 — 운영화면만
// - 운영 주소 화면(?live, 시안 C)과 테스트 주소 화면 둘 다 봄 (localhost는 기본이 테스트 화면이라 ?live를 붙여야 실제 사용자 화면)
// 문제가 하나라도 있으면 종료 코드 1
const { chromium } = require('playwright');
const fontRoute = require('./fonts');
const BASE = process.env.QA_BASE || 'http://localhost:8765/';
const WIDTHS = [320, 360, 375, 390, 412, 768, 1280];
const MODES = process.env.QA_MODES ? process.env.QA_MODES.split(',').map((m) => (m === 'test' ? '' : m)) : ['?live', ''];
const ARGC = process.argv.slice(2).filter((a) => !a.startsWith('#')), ARGH = process.argv.slice(2).filter((a) => a.startsWith('#'));
const CARS = ARGC.length ? ARGC : ['dom54', 'dom69', 'dom21', 'oth95', 'leg1'];
const TABS = ['home', 'rank', 'play', 'sq', 'wiz', 'cmp', 'fun', 'used', 'all', 'how'];
const EXTRA = ['#tab=play&g=mb', '#tab=play&mb=ESTJ', '#tab=play&g=dg', '#tab=play&g=life', '#tab=play&g=wc'].concat(ARGH); // 오락실 안쪽 화면

const scan = ([root, wb]) => {
  const out = []; const W = document.documentElement.clientWidth;
  if (document.documentElement.scrollWidth > W + 2) out.push('PAGE-HSCROLL ' + document.documentElement.scrollWidth + '>' + W);
  document.querySelectorAll(root + ' *').forEach((e) => {
    if (!e.offsetParent || e.childElementCount) return;
    let a = e.parentElement, sc = false, clip = false;
    while (a) { const ox = getComputedStyle(a).overflowX; if (ox === 'auto' || ox === 'scroll') { sc = true; break; } if (!clip && (ox === 'hidden' || ox === 'clip') && a.getBoundingClientRect().right <= W + 2) clip = true; a = a.parentElement; } // clip: 말줄임(…)으로 화면 안에서 잘라 보이는 건 넘침 아님
    if (sc) return;
    const t = e.textContent.trim();
    if (wb && t.length >= 2 && t.length <= 12 && /[가-힣]/.test(t)) { // 짧은 글에서 낱말 중간(띄어쓰기 아닌 곳)에서 줄이 바뀌었는지, 글자마다 줄 위치를 봄
      const tn = [...e.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim()); const rg = document.createRange();
      if (tn) { const s = tn.textContent; let prev = null;
        for (let i = 0; i < s.length; i++) { if (/\s/.test(s[i])) { prev = null; continue; } rg.setStart(tn, i); rg.setEnd(tn, i + 1); const q = rg.getBoundingClientRect(); if (!q.width) continue;
          if (prev !== null && q.top > prev + 4) { out.push('WORDBREAK ' + (e.className || e.tagName) + ' "' + t + '"'); break; } prev = q.top; } }
    }
    if (t.length < 6) return;
    const r = e.getBoundingClientRect(); const fs = parseFloat(getComputedStyle(e).fontSize);
    if (r.width < fs * 3.2 && r.height / (fs * 1.25) > 3) out.push('SQUEEZE ' + (e.className || e.tagName) + ' w' + Math.round(r.width) + ' "' + t.slice(0, 20) + '"');
    if (r.right > W + 2 && !clip) out.push('OVERFLOW ' + (e.className || e.tagName) + ' right' + Math.round(r.right) + ' "' + t.slice(0, 20) + '"');
  });
  return [...new Set(out)].slice(0, 10);
};

(async () => {
  const b = await chromium.launch(); let fail = 0, warned = false;
  const run = async (w, hash, root, mode) => {
    const mob = w < 768;
    const p = await b.newPage({ viewport: { width: w, height: 900 }, isMobile: mob, hasTouch: mob });
    await p.route(/wikimedia|wikipedia|googlevideo|ytimg|youtube|doubleclick|cdn\.jsdelivr|googleapis|gstatic|script\.google|kakao/, (r) => r.abort());
    // 나중에 건 route가 먼저 잡으므로 글꼴 대체는 막기(abort) 다음에 건다
    if (!(await fontRoute(p)) && !warned) { warned = true; console.log('(참고) 진짜 웹폰트 없이 대체 글꼴로 검사 중 — 위 사용법의 npm i 한 줄을 먼저 돌리면 더 정확해요'); }
    const errs = []; p.on('pageerror', (e) => errs.push('JS-ERROR ' + e.message.slice(0, 80)));
    await p.goto(BASE + mode + hash); await p.waitForTimeout(1500); await p.evaluate(() => document.fonts.ready);
    await p.evaluate(() => { document.querySelectorAll('details').forEach((d) => (d.open = true)); document.querySelectorAll('.psec.peek').forEach((d) => { d.classList.remove('peek'); d.classList.add('full'); }); });
    await p.waitForTimeout(700);
    const bad = (await p.evaluate(scan, [root, !!mode])).concat(errs); // 낱말 쪼개짐은 실제 사용자가 보는 운영화면에서만 봄
    if (bad.length) { fail++; console.log(`✗ ${w}px ${mode ? '운영화면 ' : '테스트화면 '}${hash}\n    ` + bad.join('\n    ')); }
    await p.close();
  };
  for (const m of MODES) for (const w of WIDTHS) {
    for (const c of CARS) await run(w, '#tab=prof&p=' + c, '#p-prof', m);
    for (const t of TABS) await run(w, '#tab=' + t, '#p-' + t, m);
    for (const h of EXTRA) await run(w, h, '#p-' + (h.match(/tab=(\w+)/) || [0, 'home'])[1], m);
  }
  console.log(fail ? `\n문제 ${fail}건` : `✓ 전부 통과 (${WIDTHS.length}개 폭 × ${CARS.length + TABS.length + EXTRA.length}개 화면 × ${MODES.length}가지 화면 모드)`);
  await b.close(); process.exit(fail ? 1 : 0);
})();
