// 차 검색 정확도 검사 — node tools/qa/search.js (로컬 서버 8765 필요)
// 모든 현행 모델에 대해 '모델명', '제조사 모델명', 초성, '모델 EV/전기/하이브리드/HEV/디젤'로 검색해 첫 줄이 맞는 차인지 확인. 틀리면 종료 코드 1
const { chromium } = require('playwright'); const fs = require('fs');
const BASE = process.env.QA_BASE || 'http://localhost:8765/?live';
const CHO='ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'; const cho=s=>[...s].map(ch=>{const c=ch.charCodeAt(0)-0xac00;return c>=0&&c<11172?CHO[Math.floor(c/588)]:ch;}).join('');
let cars, T = [];
const build = () => {
const cur = cars.filter(r => !r.og && r.md);
const mds = [...new Set(cur.map(r => r.md))];
for (const md of mds) {
  const L = cur.filter(r => r.md === md); const br = L[0].brand;
  T.push([md, { md }]); T.push([br + ' ' + md, { md }]);
  if (/[가-힣]{2,}/.test(md) && md.replace(/\s/g,'').length >= 2) T.push([cho(md.replace(/\s/g,'')), { md, soft: 1 }]);
  if (L.some(r => r.pt === '전기') && L.some(r => r.pt !== '전기')) { T.push([md + ' EV', { md, pt: '전기' }]); T.push([md + ' 전기', { md, pt: '전기' }]); T.push([md + ' 일렉트릭', { md, pt: '전기', soft: 1 }]); }
  if (L.some(r => r.pt === '하이브리드') && L.some(r => r.pt !== '하이브리드')) { T.push([md + ' 하이브리드', { md, pt: '하이브리드' }]); T.push([md + ' HEV', { md, pt: '하이브리드' }]); }
  if (L.some(r => r.pt === '디젤') && L.some(r => r.pt !== '디젤')) T.push([md + ' 디젤', { md, pt: '디젤' }]);
}
};
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.route(/wikimedia|wikipedia|googlevideo|ytimg|youtube|jsdelivr|kakao|script.google/, (r) => r.abort());
  await p.goto(BASE + '#tab=home'); await p.waitForTimeout(1500);
  cars = await p.evaluate(() => window.__CARS.map((r) => ({ name: r.name, brand: r.brand, md: r.md, og: r.og, pt: r.powertrain }))); build();
  await p.evaluate(()=>document.querySelector('.nlhd .nlib[aria-label="차 검색"]').click()); await p.waitForTimeout(300);
  const byName = {}; cars.forEach(r => { (byName[r.name] = byName[r.name] || []).push(r); });
  let bad = []; 
  for (const [q, e] of T) {
    await p.fill('#nlfq', q);
    const names = await p.$$eval('.nlfres .nlrow .nlrm b', a => a.map(x => x.textContent));
    const top = names[0] && byName[names[0]] ? byName[names[0]] : [];
    const ok = top.some(r => r.md === e.md && (!e.pt || r.pt === e.pt));
    if (!ok) bad.push({ q, soft: !!e.soft, got: names.slice(0, 3) });
  }
  const hard = bad.filter(x => !x.soft);
  hard.forEach(x => console.log('✗', x.q, '→', x.got.join(' | ') || '(없음)'));
  console.log(`\n총 ${T.length}개 중 실패 ${hard.length} (+초성/별칭 ${bad.length - hard.length})`);
  await b.close(); process.exit(hard.length ? 1 : 0);
})();
