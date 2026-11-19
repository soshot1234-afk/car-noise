// 수능 끝 게시물 4종 (1080x1350) → out/<폴더>/NN.jpg
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const D = __dirname, OUT = process.env.OUT || path.join(D, 'out');
const LOGO = fs.readFileSync(path.join(D, 'logo.svg'), 'utf8');
const F = '/home/claude/car-noise/tools/insta/fonts';
const C = { R: '#e2554c', O: '#e5a443', L: '#c8d758', G: '#45d37f', GOLD: '#e3b448' };
const tier = (o) => (o / 5 >= 16 ? C.G : o / 5 >= 11 ? C.L : o / 5 >= 6 ? C.O : C.R);
function gauge(f, size, lit) {
  const cols = [C.R, C.R, C.R, C.O, C.O, C.L, C.L, C.L, C.G, C.G, C.G]; lit = lit == null ? Math.round(f * 10) : lit;
  let s = `<svg viewBox="0 0 200 200" width="${size}" height="${size}">`;
  for (let i = 0; i < 11; i++) { const a = (135 + i * 27) * Math.PI / 180; s += `<circle cx="${(100 + 76 * Math.cos(a)).toFixed(1)}" cy="${(100 + 76 * Math.sin(a)).toFixed(1)}" r="13" fill="${i <= lit ? cols[i] : '#2c3446'}"/>`; }
  const a = (135 + f * 270) * Math.PI / 180;
  return s + `<line x1="100" y1="100" x2="${(100 + 54 * Math.cos(a)).toFixed(1)}" y2="${(100 + 54 * Math.sin(a)).toFixed(1)}" stroke="#f4efe2" stroke-width="9" stroke-linecap="round"/><circle cx="100" cy="100" r="14" fill="${C.GOLD}"/></svg>`;
}
const CAR = {
  경차: '<path d="M70 150v-40l25-45h110l25 45v40" /><path d="M95 108h140M150 65v43"/><circle cx="105" cy="152" r="20"/><circle cx="215" cy="152" r="20"/>',
  세단: '<path d="M20 150v-30l40-10 45-45h100l50 45 45 10v30"/><path d="M105 110h150"/><circle cx="85" cy="152" r="20"/><circle cx="235" cy="152" r="20"/>',
  SUV: '<path d="M25 150v-40l30-55h170l45 55h25v40"/><path d="M60 108h235M150 55v53"/><circle cx="90" cy="152" r="20"/><circle cx="240" cy="152" r="20"/>'
};
const car = (body, w) => `<svg viewBox="0 0 320 180" width="${w}" fill="none" stroke="#e3b448" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">${CAR[body] || CAR['세단']}</svg>`;

const css = `@font-face{font-family:P;src:url(${F}/PretendardVariable.woff2);font-weight:100 900}
@font-face{font-family:J;src:url(${F}/yg-jalnan.woff2)}
*{box-sizing:border-box;margin:0}body{background:#000}
.s{width:1080px;height:1350px;position:relative;overflow:hidden;font-family:P,sans-serif;color:#eef0f4;background:radial-gradient(110% 70% at 50% 0%,#26304a 0%,#14171d 62%);word-break:keep-all;margin-bottom:10px}
.k{position:absolute;left:80px;top:78px;font-weight:900;letter-spacing:.12em;font-size:28px;color:#e3b448}
.pg{position:absolute;right:80px;top:78px;font-weight:800;font-size:26px;color:#7f889c}
.t{font-family:J;font-size:100px;line-height:1.18;color:#fff;position:absolute;left:80px;right:80px}
.t em,.d em{font-style:normal;color:#e3b448}
.d{position:absolute;left:80px;right:80px;font-size:40px;line-height:1.6;font-weight:600;color:#c3cad8}
.ft{position:absolute;left:80px;right:80px;bottom:64px;display:flex;justify-content:space-between;align-items:center;font-size:26px;font-weight:800;color:#7f889c}
.ft b{color:#e3b448}.ft .lg{display:flex;align-items:center;gap:12px}.ft svg{width:44px;height:44px}
.bar{position:absolute;left:0;right:0;bottom:0;height:14px;background:linear-gradient(90deg,#e2554c 0 25%,#e5a443 25% 50%,#c8d758 50% 75%,#45d37f 75%)}
.chk{position:absolute;inset:0;background-image:conic-gradient(#fff 25%,transparent 0 50%,#fff 0 75%,transparent 0);background-size:90px 90px;opacity:.045}
.grid{position:absolute;left:80px;right:80px;display:grid;grid-template-columns:1fr 1fr;gap:22px}
.grid div{background:#1d2230;border:2px solid #2c3446;border-radius:28px;padding:30px;font-size:36px;font-weight:800;color:#fff;display:flex;flex-direction:column;gap:12px}
.grid i{font-style:normal;font-size:58px}
.grid small{font-size:27px;font-weight:600;color:#aab3c5;line-height:1.4}
.src{position:absolute;left:80px;right:80px;bottom:120px;font-size:23px;color:#6f788c;font-weight:600;line-height:1.5}
.cardc{position:absolute;left:64px;right:64px;top:150px;bottom:150px;background:#171b23;border:2px solid #2a3140;border-radius:44px;padding:56px 56px 50px;display:flex;flex-direction:column}
.tag{display:inline-block;align-self:flex-start;font-size:28px;font-weight:900;color:#15181e;background:#e3b448;border-radius:999px;padding:10px 24px}
.nm{font-family:J;font-size:76px;line-height:1.15;color:#fff;margin-top:22px}
.tr{font-size:28px;color:#8a93a6;font-weight:700;margin-top:10px}
.why{font-size:38px;line-height:1.55;font-weight:700;color:#d6dbe5;margin-top:26px}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:auto}
.stats div{background:#1f2430;border-radius:24px;padding:24px 18px;display:flex;flex-direction:column;gap:6px}
.stats small{font-size:25px;font-weight:800;color:#8a93a6}
.stats b{font-family:J;font-weight:400;font-size:52px;color:#fff;line-height:1.05}
.stats b span{font-family:P;font-size:26px;font-weight:800;color:#aab3c5;margin-left:4px}
.stats em{font-style:normal;font-size:23px;color:#6f788c;font-weight:700}
.carsvg{position:absolute;left:56px;bottom:330px;opacity:.95}
.ovr{position:absolute;right:56px;top:220px;display:flex;flex-direction:column;align-items:center}
.ovr b{font-family:J;font-weight:400;font-size:64px;margin-top:-30px}
.ovr small{font-size:24px;font-weight:900;color:#8a93a6;letter-spacing:.1em}
.tips{position:absolute;left:80px;right:80px;top:330px;display:flex;flex-direction:column;gap:24px}
.tips div{background:#1d2230;border:2px solid #2c3446;border-radius:28px;padding:32px 36px;display:grid;grid-template-columns:80px 1fr;gap:22px;align-items:center}
.tips i{font-style:normal;font-size:56px;text-align:center}
.tips b{display:block;font-size:40px;font-weight:900;color:#fff;margin-bottom:6px}
.tips span{font-size:30px;font-weight:600;color:#aab3c5;line-height:1.45}
.odo{display:flex;gap:12px}.odo i{font-style:normal;width:110px;height:150px;border-radius:18px;background:#0c0e12;border:2px solid #2c3446;display:grid;place-items:center;font-family:J;font-size:110px;color:#fff}`;

const ft = (pg) => `<div class="ft"><span class="lg">${LOGO}<b>CAR SQUAD</b></span><span>${pg || ''}</span></div><div class="bar"></div>`;
const slide = (id, k, pg, inner) => `<div class="s" id="${id}"><div class="chk"></div><div class="k">${k}</div><div class="pg">${pg}</div>${inner}${ft()}</div>`;

function carSlide(id, k, pg, c) {
  return slide(id, k, pg, `<div class="cardc"><div class="carsvg">${car(c.body, 400)}</div>
  <span class="tag">${c.tag}</span><div class="nm">${c.nm}</div><div class="tr">${c.trim}</div>
  <div class="why">${c.why}</div>
  <div class="ovr" style="top:auto;bottom:360px">${gauge(c.ovr / 100, 150)}<b style="color:${tier(c.ovr)}">${c.ovr}</b><small>OVR</small></div>
  <div class="stats">${c.stats.map(([l, v, u, e]) => `<div><small>${l}</small><b>${v}<span>${u || ''}</span></b>${e ? `<em>${e}</em>` : ''}</div>`).join('')}</div></div>`);
}

const decks = {
  '1_수험생_수고했어요': [
    slide('a1', 'CAR SQUAD · 수능 끝', '1 / 3', `<div class="t" style="top:200px">수험생 여러분,<br>오늘 진짜<br><em>수고했어요</em></div>
      <div class="d" style="top:640px">점수가 어떻든 오늘 하루는<br>아무 생각 말고 푹 쉬어요.<br>끝까지 앉아 있었던 것만으로 충분해요.</div>`),
    slide('a2', 'CAR SQUAD · 수능 끝', '2 / 3', `<div style="position:absolute;left:0;right:0;top:190px;display:flex;flex-direction:column;align-items:center;gap:26px">
      ${gauge(1, 330, 10)}<div class="odo">${'12'.split('').map((d) => `<i>${d}</i>`).join('')}<i style="width:auto;padding:0 26px;font-size:64px">년</i></div></div>
      <div class="d" style="top:820px;text-align:center;font-size:42px">초·중·고 12년, <em>완주</em>했어요.<br>시험지는 하루짜리지만<br>여기까지 달려온 기록은 그대로 남아요.</div>`),
    slide('a3', 'CAR SQUAD · 수능 끝', '3 / 3', `<div class="t" style="top:170px;font-size:84px">이제 하고 싶었던 거<br><em>전부</em> 해 봐요</div>
      <div class="grid" style="top:470px"><div><i>😴</i>늘어지게 자기<small>알람 끄고 하루 종일</small></div><div><i>🪪</i>운전면허 따기<small>방학이 제일 좋은 때</small></div>
      <div><i>🌊</i>친구랑 바다 보기<small>운전은 꼭 천천히</small></div><div><i>🚗</i>내 첫 차 구경하기<small>다음 게시물에 후보 정리</small></div></div>`)
  ],
  '2_케어해주신분들_수고하셨어요': [
    slide('b1', 'CAR SQUAD · 수능 끝', '1 / 3', `<div class="t" style="top:200px;font-size:88px">옆에서 같이 달려 주신<br>분들도<br><em>수고 많으셨어요</em></div>
      <div class="d" style="top:690px">부모님, 선생님, 형·누나·언니·오빠,<br>그리고 말없이 응원해 준 친구들까지.</div>`),
    slide('b2', 'CAR SQUAD · 수능 끝', '2 / 3', `<div class="t" style="top:170px;font-size:78px">수험생 뒤에는<br>이런 시간이 있었죠</div>
      <div class="tips" style="top:440px">
      <div><i>🍱</i><p><b>새벽 도시락</b><span>속 편한 메뉴 고르느라 며칠을 고민</span></p></div>
      <div><i>🚗</i><p><b>등하교·학원 픽업</b><span>밤 10시 학원 앞, 시동 켜고 기다린 시간</span></p></div>
      <div><i>🤐</i><p><b>참아 준 잔소리</b><span>하고 싶은 말 꾹 삼키고 "밥은 먹었어?"</span></p></div></div>`),
    slide('b3', 'CAR SQUAD · 수능 끝', '3 / 3', `<div style="position:absolute;left:0;right:0;top:200px;display:flex;justify-content:center">${car('세단', 520)}</div>
      <div class="t" style="top:520px;font-size:86px;text-align:center">오늘만큼은<br><em>조수석</em>에 앉으세요</div>
      <div class="d" style="top:800px;text-align:center">운전대는 잠시 내려놓고,<br>그동안 정말 고생 많으셨어요.</div>`)
  ],
  '3_수능끝_새내기_첫차후보': [
    slide('c0', 'CAR SQUAD · 수능 끝 특집', '1 / 6', `<div class="t" style="top:190px">면허 따면<br>첫 차는<br><em>뭐 타지?</em></div>
      <div class="d" style="top:640px">새내기 첫 차 후보 4대,<br>카스쿼드 능력치로 골라 봤어요.</div>
      <div style="position:absolute;right:70px;top:760px">${car('경차', 380)}</div>
      <div class="src">가격은 카스쿼드 기준 트림 · 숫자는 제조사·KNCAP 공식 값</div>`),
    carSlide('c1', 'CAR SQUAD · 새내기 첫 차', '2 / 6', { body: '경차', tag: '제일 부담 없는', nm: '현대 뉴 캐스퍼 1.0', trim: '디 에센셜 트림 기준', why: '후보 중 몸값이 가장 낮아요.<br>작아서 골목·주차 연습하기 편해요.', ovr: 50, stats: [['몸값', '1,792', '만'], ['연비', '14.3', 'km/ℓ'], ['길이', '3,595', 'mm']] }),
    carSlide('c2', 'CAR SQUAD · 새내기 첫 차', '3 / 6', { body: '경차', tag: '경차인데 넓은', nm: '기아 더 뉴 레이 1.0', trim: '시그니처 트림 기준', why: '박스형이라 안이 생각보다 넓어요.<br>친구들 태우고 짐 싣기 좋아요.', ovr: 50, stats: [['몸값', '1,955', '만'], ['연비', '12.9', 'km/ℓ'], ['휠베이스', '2,520', 'mm', '캐스퍼보다 120mm 길어요']] }),
    carSlide('c3', 'CAR SQUAD · 새내기 첫 차', '4 / 6', { body: '세단', tag: '국민 첫 차', nm: '현대 디 올 뉴 아반떼 2.0', trim: '프리미엄 트림 기준', why: '오래 탈 첫 차를 찾는다면.<br>무상 점검(리콜) 기록도 아직 없어요.', ovr: 62, stats: [['몸값', '2,771', '만'], ['연비', '14.3', 'km/ℓ'], ['충돌 안전', '1등급', '', 'KNCAP 2020년 평가']] }),
    carSlide('c4', 'CAR SQUAD · 새내기 첫 차', '5 / 6', { body: '세단', tag: '기름값 아끼는', nm: '아반떼 하이브리드 1.6', trim: '프리미엄 트림 기준', why: '연비가 가솔린 아반떼보다<br>리터당 6.9km 더 나와요.', ovr: 66, stats: [['몸값', '3,261', '만'], ['연비', '21.2', 'km/ℓ'], ['충돌 안전', '1등급', '', 'KNCAP 2020년 평가']] }),
    slide('c5', 'CAR SQUAD · 새내기 첫 차', '6 / 6', `<div class="t" style="top:170px;font-size:80px">사기 전에<br><em>이것만</em> 확인해요</div>
      <div class="tips" style="top:440px">
      <div><i>🪪</i><p><b>연습은 가족 차로 먼저</b><span>초보 땐 긁히는 게 당연해요</span></p></div>
      <div><i>📄</i><p><b>보험료부터 견적 받기</b><span>나이·경력에 따라 차값만큼 중요해요</span></p></div>
      <div><i>🔁</i><p><b>중고 첫 차도 좋은 선택</b><span>카스쿼드 '이적시장'에서 시세 비교</span></p></div></div>
      <div class="src">자세한 능력치·비교는 카스쿼드 (프로필 링크)</div>`)
  ],
  '4_고생하신분들께_조용한차': [
    slide('d0', 'CAR SQUAD · 수능 끝 특집', '1 / 6', `<div class="t" style="top:190px;font-size:92px">고생하신<br>나를 위한 차,<br><em>조용한 차</em> 4대</div>
      <div class="d" style="top:690px">수험생 뒷바라지 끝!<br>이제 운전석이 편해야 할 차례예요.</div>
      <div class="src">실내 소음: 오토뷰 80km/h 실측 (낮을수록 조용)<br>가격은 카스쿼드 기준 트림 · 안전은 KNCAP 공식</div>`),
    carSlide('d1', 'CAR SQUAD · 고생하신 분께', '2 / 6', { body: '세단', tag: '조용함 + 연비', nm: '기아 더 뉴 K8 하이브리드', trim: '1.6T HEV 시그니처 트림 기준', why: '조용한데 기름값도 덜 들어요.<br>카스쿼드 OVR 전체 7위.', ovr: 75, stats: [['실내 소음', '57.2', 'dBA'], ['연비', '17.2', 'km/ℓ'], ['몸값', '4,995', '만']] }),
    carSlide('d2', 'CAR SQUAD · 고생하신 분께', '3 / 6', { body: '세단', tag: '가장 조용한', nm: '현대 더 뉴 그랜저 2.5', trim: '캘리그래피 트림 기준', why: '이번 4대 중 실내가 가장 조용해요.<br>뒷좌석도 넉넉한 대형 세단.', ovr: 71, stats: [['실내 소음', '57.0', 'dBA'], ['연비', '11.2', 'km/ℓ'], ['몸값', '5,310', '만']] }),
    carSlide('d3', 'CAR SQUAD · 고생하신 분께', '4 / 6', { body: 'SUV', tag: 'SUV인데 조용한', nm: '제네시스 더 뉴 GV70 3.5T', trim: 'AWD 기준', why: 'SUV를 원하면서 조용함도<br>포기하기 싫을 때.', ovr: 69, stats: [['실내 소음', '57.1', 'dBA'], ['연비', '8.9', 'km/ℓ'], ['몸값', '6,323', '만']] }),
    carSlide('d4', 'CAR SQUAD · 고생하신 분께', '5 / 6', { body: 'SUV', tag: '가격까지 생각하면', nm: '르노코리아 그랑 콜레오스', trim: '2.0T 아이코닉 2WD 기준', why: '4천만 원 아래 패밀리 SUV.<br>무상 점검(리콜) 기록 아직 없음.', ovr: 67, stats: [['실내 소음', '59.4', 'dBA'], ['몸값', '3,891', '만'], ['충돌 안전', '1등급', '', 'KNCAP 2024']] }),
    slide('d5', 'CAR SQUAD · 고생하신 분께', '6 / 6', `<div class="t" style="top:200px;font-size:84px">소음 3dB 차이,<br><em>꽤 커요</em></div>
      <div class="d" style="top:470px">데시벨은 3dB만 낮아도 소리 에너지가<br>절반 정도로 줄어요.<br><br>시승할 때 라디오 끄고<br>80km/h에서 한 번 들어 보세요.</div>
      <div class="src">카스쿼드에서 차종별 실내 소음 '듣기'도 해 볼 수 있어요 (프로필 링크)</div>`)
  ]
};

(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  for (const [name, slides] of Object.entries(decks)) {
    const dir = path.join(OUT, name); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    const f = path.join(D, '_p.html'); fs.writeFileSync(f, `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${slides.join('')}</body></html>`);
    await p.goto('file://' + f); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
    const els = await p.$$('.s');
    for (let i = 0; i < els.length; i++) await els[i].screenshot({ path: path.join(dir, String(i + 1).padStart(2, '0') + '.jpg'), type: 'jpeg', quality: 92 });
    console.log(name, els.length);
  }
  await b.close();
})();
