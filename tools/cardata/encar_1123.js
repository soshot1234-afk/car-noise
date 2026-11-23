// 2026-11-23 엔카 중고 시세 다시 모으기 — www.encar.com 탭의 개발자 콘솔에서 실행 (같은 사이트라 api.encar.com 호출 가능)
// 1) 우리 차 목록(ENCARS) 받기  2) 차마다 ea(엔카 모델 검색식)로 주행 3~7만km 매물 전부 받기(IndexedDB 'enc1123')  3) MATCH로 짝 맞춰 중간값
// 결과는 data/엔카_시세_1123.csv → tools/cardata/apply_encar_1123.py 로 반영
//
// 짝 맞춤 규칙
//   국산: 같은 모델 검색식 안에서 엔진(배기량·하이브리드·디젤·LPG) 같은 매물 전체 (등급 구분 없음 — 11/05 값과 같은 기준)
//   수입: 엔카 Badge 이름이 우리 트림/차 이름 안에 들어 있는 것 중 가장 긴 것 (예: 'S580 4MATIC')
//   매물 같은 Id 중복 제거, 100만~9억 원 밖 값 제외, 중간값 사용
// 반영 기준
//   매물 5대 이상 + Badge/엔진 단위로 짝이 맞은 경우만
//   기존 값이 있으면: 변동 ±20% 이내, 매물 수가 기존의 0.3배~3배(+10) 안일 때만 갱신 (넘으면 짝이 틀렸을 수 있어 그대로 둠)
//   기존 값이 없으면 새로 채우되, 모델 검색식에 다른 트림(N·GT·쿠페 등)이 섞인 차는 제외

const N = (s) => (s || '').toLowerCase().replace(/coupé/g, '쿠페').replace(/[\s\-·.()_/,]/g, '');
const ENG = (c) => { const n = c.name, t = []; const m = n.match(/(\d\.\d)/); if (m) t.push(m[1]);
  if (/HEV|하이브리드/i.test(n)) t.push('HEV'); else if (/PHEV/i.test(n)) t.push('PHEV');
  if (/디젤|\bd\b|VGT|CRDi/i.test(n)) t.push('디젤'); if (/LPG|LPi/i.test(n)) t.push('LPG'); return t; };
const IMPORT = /^(BMW|벤츠|아우디|포르쉐|토요타|렉서스|볼보|폭스바겐|미니|테슬라|포드|지프|링컨|마세라티|랜드로버|캐딜락|혼다|푸조|폴스타|BYD|재규어)/;

function MATCH(c, L) {
  const seen = new Set();
  L = L.filter((x) => { if (seen.has(x[6])) return false; seen.add(x[6]); return x[4] > 100 && x[4] < 90000; }); // [Badge, BadgeDetail, Year, Mileage, Price, FuelType, Id]
  const imp = c.id.startsWith('de') || c.id.startsWith('oth') || IMPORT.test(c.name);
  const E = ENG(c), d = (c.name.match(/(\d\.\d)/) || [])[1];
  const eok = (x) => { const b = N(x[0] + ' ' + (x[5] || ''));
    if (E.includes('HEV') && !/hev|하이브리드/.test(b)) return false;
    if (!E.includes('HEV') && /hev|하이브리드/.test(b) && !E.includes('PHEV')) return false;
    if (E.includes('디젤') && !/디젤|crdi|vgt|tdi|\d{2,3}d|블루hdi|dci/.test(b)) return false;
    if (E.includes('LPG') && !/lpg|lpi/.test(b)) return false;
    if (d && !imp && /\d\.\d/.test(x[0]) && !x[0].includes(d)) return false;
    return true; };
  const A = L.filter(eok); let B = A, lvl = 'engine';
  if (imp) { const tn = N(c.trim) + '|' + N(c.name);
    const bs = [...new Set(A.map((x) => x[0]))].filter((b) => b && N(b).length >= 3 && tn.includes(N(b)));
    if (bs.length) { const mx = Math.max(...bs.map((b) => N(b).length)); B = A.filter((x) => bs.includes(x[0]) && N(x[0]).length === mx); lvl = 'badge'; } else lvl = 'model'; }
  const P = B.map((x) => x[4]).sort((a, b) => a - b);
  const med = P.length ? (P.length % 2 ? P[(P.length - 1) / 2] : Math.round((P[P.length / 2 - 1] + P[P.length / 2]) / 2)) : null;
  const ys = B.map((x) => Math.floor(x[2] / 100)), lo = Math.min(...ys), hi = Math.max(...ys);
  return { n: P.length, med, lvl, yr: ys.length ? (lo === hi ? '' + lo : lo + '~' + hi) : '' };
}

async function API(q, off = 0, n = 200) {
  for (let t = 0; t < 4; t++) {
    const r = await fetch('https://api.encar.com/search/car/list/general?count=true&q=' + encodeURIComponent(q) + '&sr=' + encodeURIComponent('|ModifiedDate|' + off + '|' + n));
    if (r.ok) return r.json(); await new Promise((s) => setTimeout(s, 2000 * (t + 1)));
  } throw new Error('encar api fail');
}
// 주행 3~7만km 조건은 검색식 앞에 끼워 넣음
const withMileage = (ea) => '(And.Hidden.N._.Mileage.range(30000..70000)._.' + ea.replace(/^\(And\.Hidden\.N\._\./, '');
