// 신차 집중 분석 — 뷰익 엘렉트라 E7 (한 차만 자세히, 공식 보도사진 사용)
// 실행: NODE_PATH=$(npm root -g) node tools/insta/news2/2026-11-27-e7.js /출력폴더
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const L = require('./lib.js'); const { mark, dots } = L;
const PH = (n) => `photos/2026-11-27/e7/${n}.jpg`;
const CR = '사진: GM한국사업장 제공';
const X = `
.hero{position:absolute;left:0;right:0;top:0;height:820px;overflow:hidden}
.hero img{width:100%;height:100%;object-fit:cover}
.hero:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(13,18,32,.55) 0%,rgba(13,18,32,0) 30%,rgba(13,18,32,0) 55%,#111827 100%)}
.cr{position:absolute;right:20px;z-index:2;font-size:20px;font-weight:700;color:#fff;background:rgba(13,18,32,.7);padding:4px 12px;border-radius:12px}
.ph{position:relative;border-radius:26px;overflow:hidden;background:#1a2236;flex:none}
.ph img{width:100%;height:100%;object-fit:cover}
.ph .cr{bottom:12px}
.nrow{display:grid;grid-template-columns:190px 1fr;align-items:center;gap:18px;background:#1a2236;border:1px solid #2c3550;border-radius:20px;padding:14px 26px}
.nrow b{font-size:26px;color:#a9afbb;font-weight:800}
.nrow span{font-family:J;font-size:34px;line-height:1.25}
.nrow span em{font-style:normal;color:#e3b448}
.nrow span small{display:block;font-family:P;font-size:22px;color:#8d93a1;font-weight:600;margin-top:4px;line-height:1.35}
.col{display:flex;flex-direction:column;gap:10px}
.tr{display:grid;grid-template-columns:1fr auto;align-items:center;background:#1a2236;border:1px solid #2c3550;border-radius:22px;padding:18px 28px}
.tr.best{border:3px solid #e3b448;background:#1f2741}
.tr h5{font-family:J;font-weight:400;font-size:42px}
.tr h5 small{display:block;font-family:P;font-size:23px;color:#8d93a1;font-weight:700;margin-top:6px}
.tr .v{font-family:J;font-size:50px;color:#e3b448}
.tr .v small{font-family:P;font-size:26px;color:#a9afbb;margin-left:4px;font-weight:700}
.add{background:#1a2236;border:1px solid #2c3550;border-radius:22px;padding:16px 26px}
.add h6{font-family:J;font-weight:400;font-size:34px;color:#e3b448;margin-bottom:6px}
.add h6 small{font-family:P;font-size:22px;color:#8d93a1;font-weight:700;margin-left:10px}
.add p{font-size:25px;line-height:1.45;color:#dfe3ea;font-weight:700}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.sp{background:#1a2236;border:1px solid #2c3550;border-radius:20px;padding:14px 22px}
.sp b{display:block;font-size:22px;color:#8d93a1;font-weight:800}
.sp span{font-family:J;font-size:36px}.sp span small{font-family:P;font-size:22px;color:#a9afbb;font-weight:700;margin-left:4px}
.chip{display:flex;flex-wrap:wrap;gap:12px}
.chip i{font-style:normal;display:flex;align-items:center;gap:10px;font-size:25px;font-weight:800;background:#1a2236;border:1px solid #2c3550;border-radius:30px;padding:10px 20px 10px 12px}
.chip i u{width:30px;height:30px;border-radius:50%;border:2px solid rgba(255,255,255,.35)}
.sec{font-size:24px;color:#e3b448;font-weight:800;letter-spacing:.08em;margin:6px 0 2px}
.one{font-size:28px;line-height:1.5;color:#fff;font-weight:800;background:rgba(227,180,72,.12);border:2px solid #e3b448;border-radius:22px;padding:16px 24px}
.note{font-size:22px;color:#8d93a1;font-weight:600;line-height:1.45}
.src b{color:#c9ced7}
.tm{font-size:22px;color:#6b7280;font-weight:600;margin-top:34px}
`;
const K = '신차 집중 분석';
const ttl = (t, top = 110, fs = 72) => `<div class="ttl" style="top:${top}px;font-size:${fs}px">${t}</div>`;
const main = (inner, top = 330) => `<div class="main" style="top:${top}px;bottom:120px;gap:12px">${inner}</div>`;
const photo = (n, h, pos = '50% 50%') => `<div class="ph" style="height:${h}px"><img src="${PH(n)}" style="object-position:${pos}"><span class="cr">${CR}</span></div>`;
const row = (k, v) => `<div class="nrow"><b>${k}</b><span>${v}</span></div>`;
const SRC1 = '출처: <b>GM한국사업장</b> 보도자료 (2026.09.30, 2026.11.23)';
const SRC2 = '출처: <b>뷰익코리아</b> 가격표 (2026.11.23) · <b>GM한국사업장</b> 보도자료 (2026.11.23)';
const slides = [
  // 1 표지
  `<div class="hero"><img src="${PH(1)}" style="object-position:50% 70%"></div><span class="cr" style="top:780px">${CR}</span>
   <div style="position:absolute;left:64px;right:64px;top:850px"><div style="display:flex;align-items:center;gap:18px">${mark('뷰익', 70)}<span class="pill" style="font-size:28px;padding:10px 24px">${K}</span></div>
   <h1 style="font-family:J;font-weight:400;font-size:92px;line-height:1.15;margin-top:22px">뷰익 엘렉트라 E7<br><b style="color:#e3b448;font-weight:400">총정리</b></h1>
   <p style="font-size:32px;color:#c9ced7;font-weight:700;margin-top:16px">가격 · 트림 · 제원 · 옵션 한 번에</p></div>`,
  // 2 한눈에
  ttl('어떤 차예요?<br><b>한눈에 보기</b>') + main(photo(2, 400, '50% 60%') + `<div class="col">
    ${row('파워트레인', '플러그인 하이브리드(PHEV)<small>1.5L 자연흡기 엔진 + 165kW 구동 모터</small>')}
    ${row('전기로만', '<em>80km / 126km</em><small>스탠다드 19.7kWh / 롱레인지 31.7kWh · 1회 충전 인증</small>')}
    ${row('합쳐서', '<em>1,000km 이상</em><small>엔진+모터 통합 주행거리 (제조사 발표)</small>')}
    ${row('급속충전', 'DC 30→80% <em>약 20분</em>')}</div>
    <div class="src">${SRC1}</div>`),
  // 3 가격
  ttl('트림은 4개<br><b>가격은 이래요</b>') + main(`<div class="col">
    <div class="tr"><h5>어반<small>스탠다드 배터리 · 18인치</small></h5><span class="v">4,360<small>만 원</small></span></div>
    <div class="tr"><h5>모던<small>스탠다드 배터리 · 18인치</small></h5><span class="v">4,710<small>만 원</small></span></div>
    <div class="tr"><h5>리저브<small>스탠다드 배터리 · 18인치</small></h5><span class="v">4,960<small>만 원</small></span></div>
    <div class="tr best"><h5>프리미어<small>롱레인지 배터리 · 20인치</small></h5><span class="v">5,299<small>만 원</small></span></div></div>
    <div class="one">트림마다 가격이 하나예요. 따로 고르는 추가 옵션이 없어요</div>
    <div class="note">부가가치세 포함 · 계약 전 최종 견적서로 확인</div>
    <div class="src">${SRC2}</div>`),
  // 4 트림별 추가
  ttl('윗 트림으로 가면<br><b>뭐가 더 붙나</b>') + main(`<div class="col">
    <div class="add"><h6>어반<small>기본</small></h6><p>에어백 6개 · 서라운드 비전 · 빌트인 블랙박스 · ACC · 실외 V2L</p></div>
    <div class="add"><h6>모던<small>+350만 원</small></h6><p>후방 교차충돌 경고·제동 · 차선변경·사각지대 경고 · 안전 하차 경고 · 앞좌석 통풍 · 2열 전동 리클라이닝 · 무선충전</p></div>
    <div class="add"><h6>리저브<small>+250만 원</small></h6><p>퀸 베드 모드 · 동승석 무중력 모드 · 앞좌석 마사지·메모리 · 뒷좌석 열선·통풍 · 2열 듀얼 멀티 테이블</p></div>
    <div class="add" style="border:3px solid #e3b448"><h6>프리미어<small>+339만 원</small></h6><p>롱레인지 배터리(126km) · CDC 서스펜션 · HUD · 20인치 휠 · 빌트인 냉온장고 · 스피커 20개</p></div></div>
    <div class="note">각 트림은 아래 트림 사양 포함 · 주요 항목만 골라 적었어요</div>
    <div class="src">출처: <b>뷰익코리아</b> 가격표 (2026.11.23, 언론 보도 교차 확인)</div>`),
  // 5 제원
  ttl('숫자로 보는<br><b>제원</b>') + main(`<div class="sec">크기</div><div class="g2">
    <div class="sp"><b>전장</b><span>4,850<small>mm</small></span></div><div class="sp"><b>전폭</b><span>1,910<small>mm</small></span></div>
    <div class="sp"><b>휠베이스</b><span>2,850<small>mm</small></span></div><div class="sp"><b>전고 (프리미어)</b><span>1,675<small>mm</small></span></div></div>
    <div class="sec">힘</div><div class="g2">
    <div class="sp"><b>구동 모터</b><span>165<small>kW</small> · 330<small>Nm</small></span></div><div class="sp"><b>엔진 1.5L</b><span>65<small>kW</small> · 125<small>Nm</small></span></div></div>
    <div class="sec">효율 (복합 · 표준 모드)</div><div class="g2">
    <div class="sp"><b>연비 어반~리저브 / 프리미어</b><span>14.2 / 14.1<small>km/L</small></span></div><div class="sp"><b>전비 어반~리저브 / 프리미어</b><span>3.9 / 3.8<small>km/kWh</small></span></div>
    <div class="sp"><b>공차중량 어반~리저브 / 프리미어</b><span>1,870 / 1,995<small>kg</small></span></div><div class="sp"><b>연료탱크</b><span>65<small>L</small></span></div></div>
    <div class="src">${SRC2}</div>`),
  // 6 실내
  ttl('실내는<br><b>라운지처럼</b>') + main(photo(7, 380) + `<div class="col">
    ${row('화면', '15.6인치 센터 디스플레이<br>+ 8.8인치 디지털 클러스터')}
    ${row('쉬는 기능', '퀸 베드 모드 · 동승석 무중력<small>리저브부터</small>')}
    ${row('조용함', '이중 접합 차음 유리 · ANC')}
    ${row('소리', '뷰익 서라운드 <em>스피커 20개</em><small>프리미어</small>')}</div>
    <div class="src">${SRC1}</div>`),
  // 7 2열·주행보조
  ttl('2열과<br><b>주행 보조</b>') + main(photo(8, 360, '50% 40%') + `<div class="col">
    ${row('2열', '전동 리클라이닝<small>모던부터 · 듀얼 멀티 테이블은 리저브부터 · 빌트인 냉온장고는 프리미어</small>')}
    ${row('주행 보조', 'ACC(정차·재출발) · 레인 센터링<br>자동 긴급 제동 · 서라운드 비전')}
    ${row('승차감', 'CDC 실시간 감쇠력 조절<small>프리미어</small>')}</div>
    <div class="src">${SRC2}</div>`),
  // 8 컬러·혜택·일정
  ttl('색상 · 혜택<br><b>· 계약 일정</b>') + main(`<div class="sec">외장 5색</div><div class="chip">
    <i><u style="background:#f3f3f0"></u>폴라 화이트</i><i><u style="background:#141518"></u>스텔라 블랙</i><i><u style="background:#b9bcc0"></u>실버 플레어</i><i><u style="background:#c9b99c"></u>모던 베이지</i><i><u style="background:#1f2a44"></u>미스틱 네이비</i></div>
    <div class="note">실버 플레어·모던 베이지는 리저브부터, 미스틱 네이비는 프리미어 · 동그라미 색은 이해를 돕는 예시</div>
    <div class="sec">실내 2색</div><div class="chip"><i><u style="background:#2a2530"></u>스모키 플럼 블랙</i><i><u style="background:#d8cdb8"></u>워터 릴리 베이지</i></div>
    <div class="col" style="margin-top:8px">
    ${row('계약', '사전예약 고객 11월 23일 · <em>일반 11월 25일</em>부터')}
    ${row('출시 혜택', '<em>12월 31일</em>까지 출고하면<br>소모품 케어 패키지<small>엔진오일·오일필터·에어컨필터·와이퍼 각 2회 무상 교환</small>')}
    ${row('정비', '서비스센터 <em>115개 이상</em><small>GM한국사업장 네트워크</small>')}</div>
    <div class="src">${SRC2}</div>`),
  // 9 끝
  `<div class="end"><h2>엘렉트라 E7<br><b style="color:#e3b448;font-weight:400">총정리 끝</b></h2><p>궁금한 차 있으면 댓글로<br>다음 집중 분석 해 드릴게요</p>${dots()}<div class="lk">관심 차 능력치 카드 → <b>프로필 링크</b></div><div class="tm">제조사 로고는 각 회사의 상표예요 · 정보 구분용<br>사진: GM한국사업장 제공 보도용 이미지</div></div>`,
];
(async () => {
  const out = process.argv[2] || __dirname + '/out-e7'; fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  for (let i = 0; i < slides.length; i++) {
    const html = L.page(slides[i], i + 1, slides.length, i ? K : '').replace('</style>', X + '</style>');
    const f = path.join(__dirname, '_e7_tmp.html'); fs.writeFileSync(f, html);
    await p.goto('file://' + f); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(150);
    const over = await p.evaluate(() => { const m = document.querySelector('.main'); const ft = document.querySelector('.ft'); if (!m) return false; const s = document.querySelector('.src'); return (s && s.getBoundingClientRect().bottom > ft.getBoundingClientRect().top - 8) || m.scrollHeight > m.clientHeight + 2; });
    if (over) console.warn('⚠ 내용이 넘침: 슬라이드', i + 1);
    await p.screenshot({ path: path.join(out, String(i + 1).padStart(2, '0') + '.jpg'), type: 'jpeg', quality: 92 }); fs.unlinkSync(f);
  }
  await b.close();
})();
