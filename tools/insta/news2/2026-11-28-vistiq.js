// 신차 집중 분석 — 캐딜락 비스틱 (GM한국사업장 보도자료 2026.11.27, 공식 보도사진)
// 실행: NODE_PATH=$(npm root -g) node tools/insta/news2/2026-11-28-vistiq.js /출력폴더
const { helpers, renderDeep } = require('./deeplib.js');
const H = helpers('photos/2026-11-28/vistiq', '사진: GM한국사업장 제공');
const { ttl, main, photo, row, hero, end } = H;
const SRC = '출처: <b>GM한국사업장</b> 보도자료 (2026.11.27)';
const slides = [
  hero(1, '50% 62%', '캐딜락', '캐딜락 비스틱', '총정리', '6인승 전기 대형 SUV · 1억 8,170만 원'),
  ttl('어떤 차예요?<br><b>한눈에 보기</b>') + main(photo(2, 360, '50% 55%') + `<div class="col">
    ${row('차급', '6인승 3열 전기 대형 SUV<small>"베이비 에스컬레이드" · 개발은 GM 테크니컬센터 코리아 주도</small>')}
    ${row('가격', '<em>1억 8,170만 원</em><small>플래티넘 단일 트림 · 친환경차 세제 혜택 반영 후</small>')}
    ${row('주행거리', '복합 <em>430km</em><small>도심 466 / 고속 385km · 102kWh 배터리</small>')}
    ${row('힘', '<em>615마력</em> · 89.8kgf·m<small>듀얼 모터 상시 사륜구동</small>')}</div>
    <div class="src">${SRC}</div>`),
  ttl('대형 SUV인데<br><b>3.7초</b>') + main(photo(3, 360, '50% 60%') + `<div class="col">
    ${row('0→100km/h', '약 <em>3.7초</em><small>캐딜락 자체 측정 · Velocity Max 모드 기준</small>')}
    ${row('급속충전', '최대 <em>190kW</em><small>완속(AC) 최대 19.2kW</small>')}
    ${row('충전 규격', 'NACS 기본 + DC콤보 어댑터 기본 제공<small>테슬라 슈퍼차저와 같은 규격</small>')}
    ${row('전비', '복합 3.5km/kWh<small>도심 3.9 / 고속 3.2</small>')}</div>
    <div class="src">${SRC}</div>`),
  ttl('크기는 큰데<br><b>뒷바퀴도 꺾여요</b>') + main(photo(4, 400, '50% 60%') + `<div class="col">
    ${row('뒷바퀴 조향', '액티브 리어 스티어링<small>저속에서 최대 3.5도 반대로 꺾어 회전 반경 감소</small>')}
    ${row('서스펜션', '에어 라이드 어댑티브<small>차고 자동 조절 + 실시간 가변 댐핑</small>')}
    ${row('브레이크', '전륜 브렘보 (블랙 캘리퍼)')}
    ${row('회생제동', '리젠 온 디맨드 · 원 페달 드라이빙')}</div>
    <div class="src">${SRC}</div>`),
  ttl('숫자로 보는<br><b>제원</b>') + main(`<div class="sec">크기</div><div class="g2">
    <div class="sp"><b>전장</b><span>5,235<small>mm</small></span></div><div class="sp"><b>전폭</b><span>2,025<small>mm</small></span></div>
    <div class="sp"><b>전고</b><span>1,800<small>mm</small></span></div><div class="sp"><b>휠베이스</b><span>3,094<small>mm</small></span></div></div>
    <div class="sec">무게 · 짐 공간</div><div class="g2">
    <div class="sp"><b>공차중량</b><span>2,910<small>kg</small></span></div><div class="sp"><b>트렁크 (기본)</b><span>430<small>L</small></span></div>
    <div class="sp"><b>3열 접으면</b><span>1,218<small>L</small></span></div><div class="sp"><b>2·3열 다 접으면</b><span>2,271<small>L</small></span></div></div>
    <div class="sec">배터리 · 바퀴</div><div class="g2">
    <div class="sp"><b>배터리</b><span>102<small>kWh</small></span></div><div class="sp"><b>타이어</b><span style="font-size:30px">295/40R22</span></div></div>
    <div class="src">${SRC}</div>`),
  ttl('6명이 타는<br><b>라운지</b>') + main(photo(5, 330, '50% 55%') + `<div class="col">
    ${row('좌석', '6인승 2-2-2 · 2열 독립 캡틴 시트')}
    ${row('1열', '18방향 전동<small>열선·통풍·마사지·메모리</small>')}
    ${row('화면', '<em>33인치</em> 호라이즌 디스플레이<small>1·2열 8인치 커맨드 센터 (공조·무드 조명)</small>')}
    ${row('소리', 'AKG 스튜디오 오디오 <em>스피커 23개</em>')}</div>
    <div class="src">${SRC}</div>`),
  ttl('손 떼고 달리는<br><b>슈퍼크루즈</b>') + main(photo(1, 360, '50% 70%') + `<div class="col">
    ${row('슈퍼크루즈', '<em>기본 탑재</em> 핸즈프리 운전자 보조<small>지원되는 국내 고속도로·주요 간선도로 · 전방 주시 상태에서</small>')}
    ${row('AR HUD', '증강현실 헤드업 디스플레이<small>국내 출시 캐딜락 최초</small>')}
    ${row('내비·음성', 'TMAP AUTO 내장 · NUGU auto')}
    ${row('커넥티드', '온스타 <em>8년 무상</em>')}</div>
    <div class="src">${SRC}</div>`),
  ttl('사기 전에<br><b>체크할 것</b>') + main(`<div class="col">
    ${row('트림', '플래티넘 하나<small>고를 옵션 없이 단일 가격</small>')}
    ${row('디자인', '수직형 LED 헤드램프 · 블랙 크리스탈 실드<small>22인치 휠 2종 · 실내 코나 브라운 / 블랙</small>')}
    ${row('어디서', '전국 캐딜락&GMC 전시장')}
    ${row('무상 점검', '리릭·비스틱 337대 무상 점검(리콜) 등재<small>전자식 브레이크 컨트롤 모듈 소프트웨어 업데이트 · 비스틱 2024.08~2026.09 생산분</small>')}</div>
    <div class="one">계약할 때 내 차가 이 업데이트를 받았는지 같이 물어보면 좋아요</div>
    <div class="src">출처: <b>GM한국사업장</b> 보도자료 (2026.11.27) · <b>국토교통부 자동차리콜센터</b> (2026.11.27 등재)</div>`),
  'APPCARD:photos/2026-11-28/vistiq/appcard.png',
  end('비스틱', '총정리 끝', 'GV90이랑 비교해 보고 싶으면<br>카스쿼드에서 같이 봐요'),
];
renderDeep(slides, process.argv[2] || __dirname + '/out-vistiq');
