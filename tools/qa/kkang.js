// 깡통봇 질문 알아듣기 검사 — node tools/qa/kkang.js (로컬 서버 8765 필요)
// 질문 → 답 첫 줄에 꼭 들어가야 할 글자들. 고장 나면 종료 코드 1
const { chromium } = require('playwright');
const BASE = process.env.QA_BASE || 'http://localhost:8765/';
const T = [
  ['중고 소나타 대 캐스퍼', ['[중고] 현대 쏘나타', '[신차] 현대 캐스퍼']],
  ['신차 소나타 대 아반떼', ['쏘나타', '아반떼']],
  ['현대 투싼 대 기아 스포티지', ['[신차] 현대 투싼', '[신차] 기아 스포티지']],
  ['기아차 레이 vs 현대 캐스퍼', ['기아 레이 1.0', '현대 캐스퍼 1.0']],
  ['중고 아반떼 2021 vs 신차 캐스퍼', ['[중고] 현대 아반떼', '[신차] 현대 캐스퍼']],
  ['쏘나타랑 K5', ['쏘나타', 'K5']], ['투싼 스포티지 비교해줘', ['투싼', '스포티지']],
  ['G80 vs E클래스', ['G80', '벤츠 E']], ['EV3 캐스퍼 일렉트릭', ['EV3 81.4', '캐스퍼 일렉트릭']],
  ['쏘렌토 하이브리드랑 싼타페 하이브리드', ['쏘렌토 하이브리드', '싼타페 하이브리드']],
  ['3천만 원 이하 SUV', ['3,000만 원 이하', 'SUV']], ['하이브리드 추천', ['하이브리드 —']],
  ['투싼 하이브리드 본전', ['투싼 1.6T vs']], ['중고 아반떼 시세', ['[중고]', '연식별 시세']],
  ['쏘렌토 한 달 유지비', ['쏘렌토', '유지비']], ['이번 달 할인 얼마야', ['할인은']], ['안녕', ['깡통봇이에요']],
];
(async () => {
  const b = await chromium.launch(); const p = await b.newPage(); let bad = 0;
  await p.route(/wikimedia|wikipedia|googlevideo|ytimg|youtube|jsdelivr/, (r) => r.abort());
  await p.goto(BASE + '#tab=home'); await p.waitForTimeout(1500);
  for (const [q, must] of T) {
    const head = await p.evaluate((q) => { const a = window.__kk.answer(q); return !a ? 'NULL' : a.text ? a.text : a.head; }, q);
    const miss = must.filter((m) => !head.includes(m));
    if (miss.length) { bad++; console.log(`✗ "${q}" → ${head}  (없음: ${miss.join(', ')})`); }
  }
  console.log(bad ? `\n깡통봇 오답 ${bad}건` : `✓ 깡통봇 질문 ${T.length}개 전부 통과`);
  await b.close(); process.exit(bad ? 1 : 0);
})();
