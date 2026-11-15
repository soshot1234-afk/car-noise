// 2차 세트: VS 3 + TOP 3 (고친 스타일: 큰 질문 표지 · 짧은 문구 · 새 분류 · 실측값만) — node gen4.js
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { page, esc, won, col, LOGO } = require('./gen.js');
const D = require('./data2.json');
const by = Object.fromEntries(D.map((r) => [r.id, r]));
const DIR = __dirname, OUT = path.join(DIR, 'out_set2');
const G = ['피지컬', '멘탈', '테크닉', '히든', '선수정보'];
const A = (r, k) => r.attrs.find((a) => a[0] === k);
const real = (r, k) => { const a = A(r, k); return a && !a[4] ? a : null; };
const nm = (r) => r.name.replace(/^(현대|기아|제네시스|르노코리아|KGM|쉐보레|테슬라)\s+/, '').replace(/^(디 올 뉴|더 뉴|디 올|뉴|더)\s+/, '');
const short = (r) => nm(r).split(' ').filter((w) => !/^\d+\.\d+T?$|kWh|^\(|^HEV$/.test(w)).join(' ').replace(/\s*\(.*?\)/g, '');
const mk = (r) => short(r).replace(/\s+(하이브리드|E-Tech|일렉트릭|EV|N|GT|\d+(\.\d+)?)(\s|$).*$/, '').trim();

// 인스타 다크모드(#000)·라이트모드 모두에서 테두리가 보이게, 바탕을 남색으로 살짝 띄움
const CSS4 = `
body{background:linear-gradient(165deg,#1a2338 0%,#121a2b 55%,#0e1422 100%)!important}
.cv{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;height:100%}
.cv .kk{display:inline-block;font-size:30px;font-weight:800;letter-spacing:.12em;color:#0f1115;background:#e3b448;padding:10px 24px;border-radius:40px}
.cv .a,.cv .b{font-family:J;font-weight:400;color:#fff;line-height:1.12}
.cv .vs{font-family:J;font-weight:400;font-size:110px;color:#e3b448;margin:18px 0}
.cv .q{font-size:44px;color:#c9ced7;font-weight:700;margin-top:56px;line-height:1.45}
.cv .big{font-family:J;font-weight:400;font-size:112px;line-height:1.15;color:#fff;margin-top:40px}
.cv .big b{color:#e3b448;font-weight:400}
.two{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:20px}
.pc{background:#171e2e;border:1px solid #2c3550;border-radius:28px;padding:40px 30px;text-align:center}
.pc.win{border:3px solid #e3b448}
.pc .o{font-family:J;font-weight:400;font-size:170px;line-height:.9}
.pc .ol{font-size:24px;font-weight:800;letter-spacing:.14em;color:#a9afbb;margin-top:6px}
.pc .n{font-family:J;font-weight:400;font-size:44px;line-height:1.2;color:#fff;margin-top:26px;min-height:106px}
.pc .p{font-size:28px;color:#c9ced7;font-weight:700;margin-top:14px;line-height:1.45}
.ttl{font-family:J;font-weight:400;font-size:62px;line-height:1.2;color:#fff;margin-bottom:12px}
.ttl small{display:block;font-family:P;font-size:28px;color:#a9afbb;font-weight:600;margin-top:12px}
.names{display:grid;grid-template-columns:1fr 150px 1fr;font-size:31px;font-weight:800;color:#fff;text-align:center;margin:26px 0 10px}
.gbox{background:#171e2e;border:1px solid #2c3550;border-radius:26px;padding:20px 32px}
.gr{display:grid;grid-template-columns:1fr 90px 150px 90px 1fr;align-items:center;height:132px;border-bottom:1px solid #263049}
.gr:last-child{border-bottom:0}
.gr .lb{font-size:34px;font-weight:800;text-align:center;color:#e8ebf0}
.gr .v{font-family:J;font-weight:400;font-size:54px;text-align:center}
.gr i{display:block;height:24px;border-radius:12px;background:#263049;position:relative;overflow:hidden}
.gr i em{position:absolute;top:0;bottom:0;border-radius:12px}
.gr .L em{right:0}.gr .R em{left:0}.gr .dim{opacity:.32}
.tb{background:#171e2e;border:1px solid #2c3550;border-radius:26px;padding:6px 30px}
.tr{display:grid;grid-template-columns:1fr 220px 1fr;align-items:center;min-height:112px;border-bottom:1px solid #263049;text-align:center}
.tr:last-child{border-bottom:0}
.tr .k{font-size:27px;font-weight:800;color:#a9afbb}
.tr .x{font-size:35px;font-weight:700;color:#e8ebf0;line-height:1.25}
.tr .x small{display:block;font-size:21px;color:#8d93a1;font-weight:600;margin-top:2px}
.tr .x.w{color:#45d37f}
.tr .x.w:before{content:'▲ ';font-size:22px}
.vb{background:#171e2e;border:1px solid #2c3550;border-radius:26px;padding:36px 40px;margin-bottom:24px}
.vb h4{font-family:J;font-weight:400;font-size:46px;color:#fff;margin-bottom:16px}
.vb h4 span{color:#e3b448}
.vb li{list-style:none;font-size:33px;line-height:1.55;color:#dfe3ea;font-weight:600;padding-left:42px;position:relative}
.vb li:before{content:'✓';position:absolute;left:0;color:#45d37f;font-weight:900}
.end{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;height:100%}
.end .t{font-family:J;font-weight:400;font-size:92px;line-height:1.2;color:#fff}
.end .s{font-size:40px;color:#c9ced7;font-weight:700;margin-top:40px;line-height:1.5}
.end .site{margin-top:70px;font-size:30px;color:#8d93a1;font-weight:700}
.end .site b{color:#e3b448}
.ls{display:flex;flex-direction:column;gap:16px}
.li{display:grid;grid-template-columns:96px 1fr auto;align-items:center;gap:22px;padding:24px 30px;background:#171e2e;border:1px solid #2c3550;border-radius:24px}
.li .rk{font-family:J;font-weight:400;font-size:76px;color:#e3b448;text-align:center;line-height:1}
.li.low .rk{color:#a9afbb}
.li h5{font-size:38px;font-weight:800;color:#fff;line-height:1.25}
.li p{font-size:24px;color:#a9afbb;font-weight:600;margin-top:6px}
.li .val{text-align:right}
.li .val b{display:block;font-family:J;font-weight:400;font-size:48px;color:#45d37f;white-space:nowrap}
.li .val small{font-size:21px;color:#8d93a1;font-weight:700}
.note{font-size:22px;color:#7c8291;font-weight:600;margin-top:20px;line-height:1.5}
`;
const pg = (body, i, n) => page(body, i, n).replace('</style>', CSS4 + '</style>');
const ENDSITE = `<div class="site">두 차 전체 능력치 → <b>프로필 링크</b></div>`;

// ---------------------------------------------------------------- VS
function vs(aId, bId, q, verdict, opt = {}) {
  const P = (r) => (opt.price && opt.price[r.id] != null ? opt.price[r.id] : r.price);
  const PT = (r) => (opt.tag && opt.tag[r.id] ? opt.tag[r.id] + ' ' : '') + won(P(r));
  const NM = (r) => (opt.name && opt.name[r.id]) || short(r);
  const a = by[aId], b = by[bId];
  const fs1 = (s) => (s.length > 12 ? 78 : s.length > 8 ? 92 : 108);
  const s1 = `<div class="cv"><span class="kk">${opt.kick || 'VS 매치'}</span>
<div class="a" style="font-size:${fs1(NM(a))}px;margin-top:56px">${esc(NM(a))}</div><div class="vs">VS</div><div class="b" style="font-size:${fs1(NM(b))}px">${esc(NM(b))}</div>
<div class="q">${q}</div></div>`;
  const aw = a.ovr >= b.ovr;
  const card = (r, w) => `<div class="pc ${w ? 'win' : ''}"><div class="o" style="color:${col(r.ovr / 5)}">${r.ovr}</div><div class="ol">OVR</div><div class="n">${esc(NM(r))}</div><div class="p">${r.pt} · ${r.body}<br>${PT(r)}</div></div>`;
  const s2 = `<div class="ttl">오늘의 두 선수<small>OVR = 21개 능력치 종합 (1~99)</small></div><div class="two" style="margin-top:50px">${card(a, aw)}${card(b, !aw)}</div>
<div class="note" style="margin-top:auto;font-size:28px;color:#c9ced7;text-align:center">숫자만 보면 ${aw ? esc(NM(a)) : esc(NM(b))} 승. 그런데 항목별로 보면? 👉</div>`;
  let wa = 0, wb = 0;
  const rows = G.map((k) => {
    const x = a.groups[k], y = b.groups[k];
    if (x > y + 0.3) wa++; else if (y > x + 0.3) wb++;
    const dl = x + 0.3 < y, dr = y + 0.3 < x;
    return `<div class="gr"><i class="L ${dl ? 'dim' : ''}"><em style="width:${x / 20 * 100}%;background:${col(x)}"></em></i><span class="v ${dl ? 'dim' : ''}" style="color:${col(x)}">${Math.round(x)}</span><span class="lb">${k}</span><span class="v ${dr ? 'dim' : ''}" style="color:${col(y)}">${Math.round(y)}</span><i class="R ${dr ? 'dim' : ''}"><em style="width:${y / 20 * 100}%;background:${col(y)}"></em></i></div>`;
  }).join('');
  const nn = (r) => esc(NM(r).split(' ').slice(0, 2).join(' '));
  const s3 = `<div class="ttl">5개 분류 맞대결<small>1~20점 · 흐린 쪽이 진 쪽</small></div>
<div class="names"><span>${nn(a)}</span><span></span><span>${nn(b)}</span></div><div class="gbox">${rows}</div>
<div class="note" style="text-align:center;font-size:30px;color:#c9ced7">분류 승리 <b style="color:#e3b448">${wa} : ${wb}</b></div>`;
  // 실측·공식 값만
  const ROWS = [[opt.priceLabel || '가격', 'p'], ['제로백', 'accel'], ['연비', 'eff'], ['80km/h 실내 소음', 'quiet'], ['제동거리', 'brake'], ['안전', 'safety'], ['1년 감가', 'resale'], ['1년 유지비', 'upkeep'], ['2열 여유', 'seats'], ['리콜', 'durab']];
  const fmtv = (r, k) => {
    if (k === 'p') return PT(r).replace(/^(신차|중고 시세) /, '<small>$1</small>');
    let t = real(r, k)[3];
    if (k === 'accel') return t.replace(/\s*\(.*\)/, '');
    if (k === 'brake') return t.replace(/\s*\(.*\)/, '');
    if (k === 'quiet') return t.replace(/\s*\(.*\)/, '');
    if (k === 'safety') return (t.match(/KNCAP \d등급/) || t.match(/Euro NCAP ★\d/) || [t])[0] + (/IIHS TSP\+/.test(t) ? '<small>IIHS TSP+</small>' : '');
    if (k === 'resale') return '-' + (t.match(/평균 ([\d.]+%)/) || [, '?'])[1];
    if (k === 'upkeep') return t.replace(/\s*\(.*\)/, '');
    if (k === 'seats') return '지수 ' + (t.match(/지수 ([\d.]+)/) || [, '?'])[1] + '<small>휠베이스·전폭·전고</small>';
    if (k === 'durab') return (t.match(/리콜 \d+회/) || [t])[0] + '<small>' + ((t.match(/연 ([\d.]+)회꼴/) || [, ''])[1] ? '연 ' + t.match(/연 ([\d.]+)회꼴/)[1] + '회꼴' : '') + '</small>';
    return t;
  };
  const sc = (r, k) => (k === 'p' ? -P(r) : k === 'durab' ? -A(r, k)[2] : A(r, k)[2]); // 부상빈도는 점수가 높을수록 리콜이 많음
  const trs = ROWS.filter(([, k]) => k === 'p' || (real(a, k) && real(b, k))).slice(0, 8).map(([lab, k]) => {
    const x = sc(a, k), y = sc(b, k);
    return `<div class="tr"><span class="x ${x > y ? 'w' : ''}">${fmtv(a, k)}</span><span class="k">${lab}</span><span class="x ${y > x ? 'w' : ''}">${fmtv(b, k)}</span></div>`;
  }).join('');
  const s4 = `<div class="ttl">실제 수치로 보면<small>▲ 초록 = 더 좋은 쪽 · 실측·공식 값만</small></div>
<div class="names"><span>${nn(a)}</span><span></span><span>${nn(b)}</span></div><div class="tb">${trs}</div>`;
  const s5 = `<div class="ttl" style="margin-bottom:34px">그래서 누구에게?</div>${verdict.map(([who, pts]) => `<div class="vb"><h4><span>${who}</span> 쪽이라면</h4><ul>${pts.map((p) => `<li>${p}</li>`).join('')}</ul></div>`).join('')}`;
  const s6 = `<div class="end"><div class="t">여러분이라면<br>어느 쪽? 🤔</div><div class="s">댓글로 골라 주세요.<br>친구한테 물어보기도 환영 🙌</div>${ENDSITE}</div>`;
  return [s1, s2, s3, s4, s5, s6];
}

// ---------------------------------------------------------------- TOP
function top(cover, title, sub, items, val, note) {
  const s1 = `<div class="cv"><span class="kk">TOP ${items.length}</span><div class="big">${cover}</div><div class="q">${sub}</div></div>`;
  const li = (r, i) => { const v = val(r); return `<div class="li ${i >= 3 ? 'low' : ''}"><span class="rk">${i + 1}</span><div><h5>${esc(short(r))}</h5><p>${r.pt} · ${r.body} · ${won(r.price)}</p></div><div class="val"><b>${v[0]}</b><small>${v[1]}</small></div></div>`; };
  const pages = [];
  for (let i = 0; i < items.length; i += 5) pages.push(`<div class="ttl">${title}<small>${i + 1}위 ~ ${Math.min(items.length, i + 5)}위</small></div><div class="ls" style="margin-top:30px">${items.slice(i, i + 5).map((r, j) => li(r, i + j)).join('')}</div><div class="note">${note}</div>`);
  const end = `<div class="end"><div class="t">순위 보고<br>의외인 차 있었나요? 👀</div><div class="s">내 차는 몇 위인지 궁금하면<br>댓글로 차 이름 남겨 주세요.</div><div class="site">예산·차급별 전체 순위 → <b>프로필 링크</b></div></div>`;
  return [s1, ...pages, end];
}
function pickTop(f, key, n, asc) {
  const seen = new Set();
  return D.filter((r) => !/^(leg|f)\d/.test(r.id) && !r.og && f(r)).sort((x, y) => (asc ? key(x) - key(y) : key(y) - key(x))).filter((r) => { const k = mk(r); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, n);
}
const depy = (r) => { const a = real(r, 'resale'); const m = a && a[3].match(/평균 ([\d.]+)%/); return m ? +m[1] : NaN; };
const z = (r) => { const a = real(r, 'accel'); const m = a && a[3].match(/([\d.]+)초/); return m ? +m[1] : NaN; };
const cab = (r) => { const a = A(r, 'seats'); const m = a && a[3].match(/지수 ([\d.]+)/); return m ? +m[1] : NaN; };

const T1 = pickTop((r) => !isNaN(depy(r)) && r.price >= 1500 && r.price <= 8000, depy, 10, true);
const T2 = pickTop((r) => r.origin === '국산' && !isNaN(z(r)), z, 10, true);
const T5 = pickTop((r) => ['SUV', 'MPV'].includes(r.body) && r.price <= 6000 && !isNaN(cab(r)), cab, 5, false);

const posts = [
  { key: 'V1_카니발vs팰리세이드', slides: vs('dom53', 'dom19', '패밀리카<br>하나만 고르면?', [
    ['카니발', ['2열·3열 여유는 카니발이 한 수 위 (2열 여유 지수 87 vs 75)', '제동거리 37.5m로 더 짧음', '1,300만 원 정도 저렴, 감가도 덜함']],
    ['팰리세이드', ['제로백 7.2초로 확실히 잘 나감 (카니발 8.9초)', '실내가 조금 더 조용함 (60.3 vs 61dBA)', '2025년 풀체인지 최신 모델']]]) },
  { key: 'V2_모델Yvs아이오닉5', slides: vs('oth42', 'dom27', '전기차 1등 싸움<br>당신의 선택은?', [
    ['모델 Y', ['제로백 5.8초(실측)로 시원하게 나감', '800만 원 정도 저렴', '유지비 연 100만 원대로 최저 수준']],
    ['아이오닉 5', ['국내 충돌평가 KNCAP 1등급 (모델 Y 이전 세대는 4등급)', '실내가 조금 더 조용함 (59.2 vs 59.7dBA)', '휠베이스 3m, 2열이 넉넉']]]) },
  { key: 'V3_캐스퍼vs레이', slides: vs('dom21', 'dom34', '경차 라이벌<br>누가 이길까?', [
    ['캐스퍼', ['연비 14.3km/ℓ로 더 좋음', '160만 원 정도 저렴', 'SUV 스타일 디자인']],
    ['레이', ['박스형이라 실내가 높고 넓음 (전고 1,710mm)', '중고로 팔 때 값이 덜 떨어짐 (연 -6.8%)', '오래 팔린 검증된 차']]]) },
  { key: 'T1_감가방어TOP10', slides: top('중고로 팔 때<br><b>값 덜 떨어지는</b> 차', '감가 방어 TOP 10', '1년에 몇 %씩 떨어지는지<br>엔카 실제 시세로 뽑았어요', T1, (r) => ['-' + depy(r) + '%', '1년 평균 하락'], '엔카 연식별 시세 기준 연평균 하락률 · 같은 모델은 1개만 · 신차가 1,500만~8,000만 원') },
  { key: 'T2_제로백TOP10', slides: top('제로백<br><b>가장 빠른</b> 국산차', '국산 제로백 TOP 10', '0→100km/h<br>실측·공식 기록만 모았어요', T2, (r) => [z(r) + '초', '0→100km/h'], '실측·제조사 발표 기록만 · 같은 모델은 1개만') },
  { key: 'T3_패밀리카TOP5', slides: top('뒷좌석<br><b>가장 넉넉한</b> 패밀리카', '2열 여유 TOP 5', '6천만 원 이하 SUV·미니밴<br>휠베이스·전폭·전고로 계산', T5, (r) => ['지수 ' + Math.round(cab(r)), '2열 여유'], '2열 여유 지수 = 휠베이스·전폭·전고 + 차체 형태로 계산한 값 · 6천만 원 이하 · 같은 모델은 1개만') },
];

module.exports = { vs, top, pg, by, D, short, real, A };
if (require.main === module) (async () => {
  fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  for (const post of posts) {
    const d = path.join(OUT, post.key); fs.mkdirSync(d);
    for (let i = 0; i < post.slides.length; i++) {
      const f = path.join(DIR, '_tmp.html'); fs.writeFileSync(f, pg(post.slides[i], i + 1, post.slides.length));
      await p.goto('file://' + f); await p.evaluate(() => document.fonts.ready);
      await p.screenshot({ path: path.join(d, String(i + 1).padStart(2, '0') + '.jpg'), type: 'jpeg', quality: 92 });
    }
    console.log(post.key, post.slides.length);
  }
  await b.close();
  const L = (arr, v) => arr.map((r, i) => `${i + 1}. ${short(r)} — ${v(r)}`).join('\n');
  fs.writeFileSync(path.join(DIR, 'set2_lists.txt'), ['T1\n' + L(T1, (r) => '-' + depy(r) + '%'), 'T2\n' + L(T2, (r) => z(r) + '초'), 'T5\n' + L(T5, (r) => '지수 ' + Math.round(cab(r)))].join('\n\n'));
})();
