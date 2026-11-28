// 신차 집중 분석 — 제네시스 GV90 / GV90 네오룬 (현대자동차그룹 보도자료 2026.11.10, 공식 보도사진)
// 실행: NODE_PATH=$(npm root -g) node tools/insta/news2/2026-11-28-gv90.js /출력폴더
const { helpers, renderDeep } = require('./deeplib.js');
const H = helpers('photos/2026-11-28/gv90', '사진: 제네시스 제공');
const { ttl, main, photo, row, hero, end, PH, CR } = H;
const SRC = '출처: <b>제네시스</b> 보도자료 (2026.11.10, 현대자동차그룹 뉴스룸)';
const grid = (ns) => `<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;flex:1">${ns.map(([n, pos]) => `<div class="ph" style="height:100%;min-height:0"><img src="${PH(n)}" style="object-position:${pos || '50% 50%'}"></div>`).join('')}</div>`;
const slides = [
  hero(1, '45% 60%', '제네시스', '제네시스 GV90', '총정리', '초대형 전기 SUV · 1억 3,950만 원부터'),
  ttl('어떤 차예요?<br><b>한눈에 보기</b>') + main(photo(7, 360, '50% 55%') + `<div class="col">
    ${row('모델 2개', 'GV90 (스윙 도어)<br>GV90 네오룬 (아치 게이트)')}
    ${row('배터리', '<em>123.5kWh</em><small>현대차그룹 전기차 중 가장 큰 용량</small>')}
    ${row('힘', '합산 <em>490kW</em> · 800Nm<small>현대차그룹 전기차 중 가장 강력</small>')}
    ${row('주행거리', 'GV90 <em>500km</em> · 네오룬 460km<small>22인치 휠 / 24인치 휠·6인승 기준</small>')}</div>
    <div class="src">${SRC}</div>`),
  ttl('트림 4개<br><b>가격은 이래요</b>') + main(`<div class="col">
    <div class="tr"><h5>GV90 스탠다드<small>7인승</small></h5><span class="v">1억 3,950<small>만 원</small></span></div>
    <div class="tr"><h5>GV90 인디비쥬얼 라운지 시트<small>6인승</small></h5><span class="v">1억 4,550<small>만 원</small></span></div>
    <div class="tr"><h5>네오룬 스탠다드<small>6인승</small></h5><span class="v">1억 8,990<small>만 원</small></span></div>
    <div class="tr best"><h5>네오룬 이그제큐티브 스위트<small>4인승</small></h5><span class="v">2억 3,950<small>만 원</small></span></div></div>
    <div class="note">GV90: 개별소비세 5% 및 친환경차 세제 혜택 반영 기준 · 네오룬: 개별소비세 5% 기준 · 11월 10일 계약 시작</div>
    ` + photo(3, 190, '50% 62%') + `<div class="src">${SRC}</div>`),
  ttl('충전은 빠르고<br><b>몸놀림은 우아하게</b>') + main(photo(8, 360, '50% 60%') + `<div class="col">
    ${row('급속충전', '10→80% 약 <em>22분</em><small>350kW급 충전기 기준</small>')}
    ${row('충전 편의', 'PnC 2.0 · 꽂으면 인증·결제까지<small>현대차그룹 최초</small>')}
    ${row('섀시', '듀얼 e-LSD · 멀티 챔버 에어 서스펜션<small>능동형 후륜 조향</small>')}
    ${row('조용함', '모든 유리에 <em>5mm 넘는</em> 차음 유리')}</div>
    <div class="src">${SRC}</div>`),
  ttl('네오룬만의<br><b>아치 게이트</b>') + main(photo('rv/3', 400, '50% 60%') + `<div class="col">
    ${row('문', 'B필러 없이 마주 보고 열리는 코치 도어<small>독립 개폐형 히든 B필러 코치 도어 세계 최초</small>')}
    ${row('앞좌석', '<em>180도</em> 도는 전동 스위블링 시트<small>현대차그룹 최초 · 정차 중</small>')}
    ${row('안전', '히든 롤케이지 구조<small>B필러 있는 차와 동등한 충돌 안전 성능 (제조사 설명)</small>')}</div>
    <div class="src">${SRC}</div>`),
  ttl('4인승 이그제큐티브<br><b>스위트</b>') + main(photo(5, 400, '50% 55%') + `<div class="col">
    ${row('바닥', '온돌에서 착안한 <em>복사열 난방</em> 우드 플로어')}
    ${row('공간', '뒷좌석·트렁크를 나누는 컴포트 파티션')}
    ${row('뒷좌석', '냉장고 · 테이블 · 타워 콘솔<small>스마트 비전 루프 · 세미 아닐린 가죽</small>')}</div>
    <div class="src">${SRC}</div>`),
  ttl('실내는<br><b>럭셔리 라운지</b>') + main(photo('rv/10', 380, '50% 50%') + `<div class="col">
    ${row('화면', '팝업형 OLED <em>23.6 → 24.6인치</em><small>정차하면 화면 면적 약 1.7배</small>')}
    ${row('HUD', '<em>25인치</em> 헤드업 디스플레이')}
    ${row('소리', '뱅앤올룹슨 <em>스피커 25개</em>')}
    ${row('시트', '공기 주머니 15개 + 진동 모듈 마사지')}</div>
    <div class="src">${SRC}</div>`),
  ttl('안전과<br><b>똑똑한 기능</b>') + main(photo('rv/12', 360, '50% 55%') + `<div class="col">
    ${row('에어백', '총 <em>12개</em> · 세계 최초 루프 에어백<small>루프 에어백은 비전 루프 적용 시</small>')}
    ${row('시동', '시동 버튼 없는 <em>버튼리스</em> 전원<small>현대차그룹 최초</small>')}
    ${row('주행 보조', '고속도로 주행 보조 2 · 내비 기반 SCC 2<small>원격 스마트 주차 보조 3 · 기억 후진 보조</small>')}</div>
    <div class="src">${SRC}</div>`),
  ttl('숫자로 보는<br><b>제원 · 색상</b>') + main(`<div class="sec">크기 · 무게 (GV90)</div><div class="g2">
    <div class="sp"><b>전장</b><span>5,285<small>mm</small></span></div><div class="sp"><b>전폭</b><span>2,030<small>mm</small></span></div>
    <div class="sp"><b>전고 (22 / 24인치)</b><span>1,815 / 1,825<small>mm</small></span></div><div class="sp"><b>휠베이스</b><span>3,245<small>mm</small></span></div>
    <div class="sp"><b>공차중량</b><span>3,030~3,060<small>kg</small></span></div><div class="sp"><b>복합 전비</b><span>3.4<small>km/kWh</small></span></div></div>
    <div class="sec">색상</div><div class="g2">
    <div class="sp"><b>외장</b><span>16<small>종 (유광 13 · 무광 3)</small></span></div><div class="sp"><b>내장</b><span>5<small>종 (모델별)</small></span></div></div>
    <div class="note">세이셸 베이지 · 바에나 그린 · 소노란 네이비 · 자이푸르 로즈 · 벨라 버건디 · 우유니 화이트 등</div>
    <div class="src">출처: <b>제네시스</b> 보도자료 (2026.11.10) · <b>제네시스</b> 홈페이지 제원표</div>`),
  ttl('공식 사진으로<br><b>더 보기</b>') + main(grid([['rv/6'], ['rv/5'], ['rv/14'], ['rv/15']]) + `<div class="note" style="margin-top:10px">${CR} 보도용 이미지</div>`),
  'APPCARD:photos/2026-11-28/gv90/appcard.png',
  end('GV90', '총정리 끝', '비스틱이랑 붙여 보면 재밌어요<br>카스쿼드에서 같이 비교해 봐요'),
];
renderDeep(slides, process.argv[2] || __dirname + '/out-gv90');
