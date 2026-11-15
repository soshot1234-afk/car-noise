// 카스쿼드 인스타 첫 세트 생성기: node gen.js
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const D = require('./data2.json');
const MB = require('./mbti.js');
const by = Object.fromEntries(D.map((r) => [r.id, r]));
const DIR = __dirname;
const OUT = path.join(DIR, 'out');
const HANDLE = '@car_squad2026';
const LOGO = fs.readFileSync(path.join(DIR, 'favicon.svg'), 'utf8');

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const won = (v) => (v >= 10000 ? (v / 10000).toFixed(1).replace(/\.0$/, '') + '억' : Math.round(v).toLocaleString('ko-KR') + '만') + ' 원';
const col = (v) => (v == null || isNaN(v) ? '#596170' : v >= 16 ? '#45d37f' : v >= 11 ? '#c8d758' : v >= 6 ? '#e5a443' : '#e2554c');
const A = (r, k) => r.attrs.find((a) => a[0] === k);
const plain = (s) => String(s || '').replace(/\s*\(.*?\)\s*/g, ' ').trim();
const nm = (r) => r.name.replace(/^(현대|기아|제네시스|르노코리아|KGM|쉐보레)\s+/, '').replace(/^(디 올 뉴|더 뉴|디 올|뉴|더)\s+/, '');
const G = ['정숙', '성능', '효율', '공간', '안전', '가치'];

const CSS = `
@font-face{font-family:J;src:url(fonts/yg-jalnan.woff2)}
@font-face{font-family:P;src:url(fonts/PretendardVariable.woff2);font-weight:100 900}
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;height:1350px;background:#0f1115;color:#f4efe2;font-family:P,sans-serif;position:relative;overflow:hidden;word-break:keep-all}
.glow{position:absolute;right:-260px;top:-260px;width:820px;height:820px;border-radius:50%;background:radial-gradient(circle,rgba(227,180,72,.15),transparent 65%)}
.glow2{position:absolute;left:-300px;bottom:-300px;width:760px;height:760px;border-radius:50%;background:radial-gradient(circle,rgba(69,211,127,.08),transparent 65%)}
.hd{position:absolute;left:64px;right:64px;top:56px;display:flex;align-items:center;justify-content:space-between}
.brand{display:flex;align-items:center;gap:14px}.brand svg{width:54px;height:54px}
.brand b{font-family:J;font-weight:400;font-size:30px;letter-spacing:.02em}
.pg{font-size:24px;font-weight:700;color:#8d93a1;letter-spacing:.05em}
.ft{position:absolute;left:64px;right:64px;bottom:52px;display:flex;justify-content:space-between;font-size:24px;color:#8d93a1;font-weight:600}
.bar{position:absolute;left:0;right:0;bottom:0;height:14px;background:linear-gradient(90deg,#e2554c 0 25%,#e5a443 25% 50%,#c8d758 50% 75%,#45d37f 75%)}
.main{position:absolute;left:64px;right:64px;top:170px;bottom:130px;display:flex;flex-direction:column}
.kick{display:inline-block;align-self:flex-start;font-size:26px;font-weight:800;letter-spacing:.14em;color:#0f1115;background:#e3b448;padding:8px 18px;border-radius:8px}
.t1{font-family:J;font-weight:400;font-size:92px;line-height:1.12;margin-top:34px;color:#fff}
.t2{font-family:J;font-weight:400;font-size:64px;line-height:1.18;color:#fff}
.gold{color:#e3b448}
.sub{font-size:36px;line-height:1.5;color:#c9ced7;font-weight:600;margin-top:28px}
.h{font-family:J;font-weight:400;font-size:56px;line-height:1.2;color:#fff;margin-bottom:34px}
.h small{display:block;font-family:P;font-size:28px;color:#a9afbb;font-weight:600;margin-top:12px}
.card{background:#171b23;border:1px solid #2a3140;border-radius:24px}
.mid{margin-top:auto;margin-bottom:auto}
/* VS */
.vsrow{display:grid;grid-template-columns:1fr 110px 1fr;align-items:center;margin-top:60px}
.vsc{padding:34px 28px;text-align:center}
.vsc .o{font-family:J;font-weight:400;font-size:150px;line-height:.9}
.vsc .ol{font-size:24px;font-weight:800;letter-spacing:.14em;color:#a9afbb;margin-top:6px}
.vsc .n{font-family:J;font-weight:400;font-size:40px;line-height:1.2;margin-top:24px;color:#fff;min-height:96px}
.vsc .p{font-size:27px;color:#c9ced7;margin-top:12px;font-weight:600}
.vs{font-family:J;font-weight:400;font-size:64px;text-align:center;color:#e3b448}
.win{border:3px solid #e3b448;position:relative}
.win:after{content:'OVR 승';position:absolute;top:-22px;left:50%;transform:translateX(-50%);background:#e3b448;color:#0f1115;font-size:22px;font-weight:900;padding:4px 14px;border-radius:20px}
.grp{padding:30px 34px}
.gr{display:grid;grid-template-columns:1fr 92px 120px 92px 1fr;align-items:center;height:118px;border-bottom:1px solid #262c38}
.gr:last-child{border-bottom:0}
.gr .lb{font-size:34px;font-weight:800;text-align:center;color:#e8ebf0}
.gr .v{font-family:J;font-weight:400;font-size:52px;text-align:center}
.gr i{display:block;height:22px;border-radius:12px;background:#262c38;position:relative;overflow:hidden}
.gr i em{position:absolute;top:0;bottom:0;border-radius:12px}
.gr .L em{right:0}.gr .R em{left:0}
.gr .dim{opacity:.35}
.names{display:grid;grid-template-columns:1fr 120px 1fr;font-size:30px;font-weight:800;margin-bottom:10px;color:#fff;text-align:center}
.tbl{padding:12px 34px}
.tr{display:grid;grid-template-columns:1fr 210px 1fr;align-items:center;min-height:106px;border-bottom:1px solid #262c38;text-align:center}
.tr:last-child{border-bottom:0}
.tr .k{font-size:28px;font-weight:800;color:#a9afbb}
.tr .x{font-size:36px;font-weight:700;color:#e8ebf0;line-height:1.25;padding:0 6px}
.tr .x small{display:block;font-size:22px;color:#8d93a1;font-weight:600;margin-top:4px}
.tr .x.w{color:#45d37f}
.tr .x.w:before{content:'▲ ';font-size:24px}
.vd{display:flex;flex-direction:column;gap:30px}
.vb{padding:38px 40px}
.vb h4{font-family:J;font-weight:400;font-size:44px;color:#fff;margin-bottom:18px}
.vb h4 span{color:#e3b448}
.vb li{list-style:none;font-size:33px;line-height:1.55;color:#dfe3ea;font-weight:600;padding-left:40px;position:relative}
.vb li:before{content:'✓';position:absolute;left:0;color:#45d37f;font-weight:900}
/* TOP */
.tp{display:flex;flex-direction:column;gap:18px}
.ti{display:grid;grid-template-columns:110px 1fr auto;align-items:center;gap:22px;padding:24px 30px}
.ti .rk{font-family:J;font-weight:400;font-size:84px;color:#e3b448;text-align:center;line-height:1}
.ti:nth-child(n+4) .rk{color:#a9afbb}
.ti .nm{font-size:38px;font-weight:800;color:#fff;line-height:1.25}
.ti .nm small{display:block;font-size:25px;color:#a9afbb;font-weight:600;margin-top:6px}
.ti .val{text-align:right}
.ti .val b{display:block;font-family:J;font-weight:400;font-size:46px;color:#45d37f;white-space:nowrap}
.ti .val small{font-size:22px;color:#8d93a1;font-weight:700}
/* CTA */
.cta{align-items:center;text-align:center;justify-content:center}
.cta .lg svg{width:200px;height:200px}
.cta .t2{margin-top:40px}
.btn{display:inline-block;margin-top:48px;font-size:38px;font-weight:900;color:#0f1115;background:#e3b448;padding:26px 54px;border-radius:60px}
.chips{display:flex;flex-wrap:wrap;gap:14px;justify-content:center;margin-top:44px;max-width:900px}
.chips span{font-size:28px;font-weight:700;padding:12px 24px;border-radius:40px;border:1px solid #3a4252;color:#dfe3ea}
/* 소개 */
.leg{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:40px}
.leg div{padding:28px 10px;text-align:center;border-radius:20px;background:#171b23;border:1px solid #2a3140}
.leg b{display:block;font-family:J;font-weight:400;font-size:60px}
.leg span{font-size:26px;color:#c9ced7;font-weight:700}
.feat{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.feat div{padding:34px 30px}
.feat b{display:block;font-size:56px}
.feat h5{font-family:J;font-weight:400;font-size:38px;color:#fff;margin-top:14px}
.feat p{font-size:26px;color:#a9afbb;font-weight:600;margin-top:10px;line-height:1.45}
.fc{padding:40px 44px;margin-top:20px}
.fc .row{display:flex;align-items:center;gap:22px}
.fc .ov{font-family:J;font-weight:400;font-size:120px;color:#c8d758;line-height:.9}
.fc .ar{display:grid;gap:12px;margin-top:30px}
.fc .ar div{display:grid;grid-template-columns:110px 1fr 70px;align-items:center;gap:18px;font-size:30px;font-weight:800}
.fc .ar i{display:block;height:20px;border-radius:10px;background:#262c38;position:relative;overflow:hidden}
.fc .ar i em{position:absolute;left:0;top:0;bottom:0;border-radius:10px}
.fc .ar b{font-family:J;font-weight:400;font-size:40px;text-align:right}
/* MBTI */
.mbg{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.mbt{padding:22px 24px}
.mbt b{font-family:J;font-weight:400;font-size:46px;color:#e3b448;letter-spacing:.04em}
.mbt h6{font-size:29px;color:#fff;font-weight:800;margin-top:6px}
.mbt p{font-size:23px;color:#a9afbb;font-weight:600;margin-top:8px;line-height:1.4}
.ax{display:flex;flex-direction:column;gap:20px}
.ax div{padding:30px 34px;display:grid;grid-template-columns:150px 1fr;align-items:center;gap:20px}
.ax b{font-family:J;font-weight:400;font-size:56px;color:#e3b448}
.ax h5{font-size:36px;color:#fff;font-weight:800}
.ax p{font-size:26px;color:#a9afbb;font-weight:600;margin-top:6px}
/* 퀴즈 */
.qq{font-family:J;font-weight:400;font-size:68px;line-height:1.25;color:#fff;margin-top:30px}
.qo{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:70px}
.qo div{padding:44px 30px;text-align:center;border:3px solid #2a3140;border-radius:24px;background:#171b23}
.qo b{display:block;font-family:J;font-weight:400;font-size:84px;color:#e3b448}
.qo h5{font-size:38px;color:#fff;font-weight:800;margin-top:18px;line-height:1.3}
.qo p{font-size:26px;color:#a9afbb;font-weight:600;margin-top:10px}
.qo .ok{border-color:#45d37f;background:rgba(69,211,127,.08)}
.qo .no{opacity:.55}
.qo .vv{font-family:J;font-weight:400;font-size:58px;margin-top:20px}
.qo .ok .vv{color:#45d37f}
.hint{font-size:32px;color:#c9ced7;font-weight:700;text-align:center;margin-top:60px}
.ex{font-size:31px;line-height:1.55;color:#dfe3ea;font-weight:600;padding:34px 38px;margin-top:40px}
.note{font-size:22px;color:#7c8291;font-weight:600;margin-top:auto;line-height:1.5}
`;

function page(body, i, n) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body><div class="glow"></div><div class="glow2"></div>
<div class="hd"><div class="brand">${LOGO}<b>CAR SQUAD</b></div><div class="pg">${n > 1 ? `${i} / ${n}` : ''}</div></div>
<div class="main">${body}</div>
<div class="ft"><span>${HANDLE}</span><span>${i < n ? '옆으로 넘기기 →' : '카스쿼드 · 차를 선수처럼'}</span></div><div class="bar"></div></body></html>`;
}

function cta(title, sub) {
  return `<div class="main cta" style="position:static;height:100%;display:flex;flex-direction:column">
<div class="lg">${LOGO}</div>
<div class="t2">${title}</div>
<div class="sub">${sub}</div>
<div class="btn">프로필 링크에서 확인하기</div>
<div class="chips"><span>🏆 765종 랭킹</span><span>🎯 맞춤 추천</span><span>⚔️ 1:1 비교</span><span>🧠 차 MBTI</span><span>🔁 갈아타기 비용</span></div></div>`;
}

// ---------- VS
function vsSlides(aId, bId, title, verdict) {
  const a = by[aId], b = by[bId];
  const aw = a.ovr >= b.ovr;
  const s1 = `<span class="kick">VS 매치</span>
<div class="t2" style="margin-top:30px">${title}</div>
<div class="vsrow">
 <div class="card vsc ${aw ? 'win' : ''}"><div class="o" style="color:${col(a.ovr / 5)}">${a.ovr}</div><div class="ol">OVR</div><div class="n">${esc(nm(a))}</div><div class="p">${a.pt} · ${won(a.price)}</div></div>
 <div class="vs">VS</div>
 <div class="card vsc ${!aw ? 'win' : ''}"><div class="o" style="color:${col(b.ovr / 5)}">${b.ovr}</div><div class="ol">OVR</div><div class="n">${esc(nm(b))}</div><div class="p">${b.pt} · ${won(b.price)}</div></div>
</div>
<div class="sub" style="text-align:center;margin-top:56px">능력치로 붙여 보면 누가 이길까? 👉</div>`;
  let wa = 0, wb = 0;
  const rows = G.map((k) => {
    const x = a.groups[k], y = b.groups[k];
    const ok = x != null && y != null;
    if (ok && x > y + 0.25) wa++; else if (ok && y > x + 0.25) wb++;
    const dl = ok && x + 0.25 < y, dr = ok && y + 0.25 < x;
    const f = (v) => (v == null ? '–' : Math.round(v));
    return `<div class="gr"><i class="L ${dl ? 'dim' : ''}"><em style="width:${(x || 0) / 20 * 100}%;background:${col(x)}"></em></i><span class="v ${dl ? 'dim' : ''}" style="color:${col(x)}">${f(x)}</span><span class="lb">${k}</span><span class="v ${dr ? 'dim' : ''}" style="color:${col(y)}">${f(y)}</span><i class="R ${dr ? 'dim' : ''}"><em style="width:${(y || 0) / 20 * 100}%;background:${col(y)}"></em></i></div>`;
  }).join('');
  const s2 = `<div class="h">능력치 6개 그룹 맞대결<small>1~20점 · 초록일수록 강함 · 흐린 쪽이 진 쪽</small></div>
<div class="names"><span>${esc(nm(a).split(' ').slice(0, 2).join(' '))}</span><span></span><span>${esc(nm(b).split(' ').slice(0, 2).join(' '))}</span></div>
<div class="card grp">${rows}</div>
<div class="sub" style="text-align:center;margin-top:30px">그룹 승리 <b class="gold">${wa} : ${wb}</b></div>`;
  const spec = [['가격', 'p'], ['연비', 'eff'], ['80km/h 실내 소음', 'quiet'], ['제로백', 'accel'], ['안전', 'safety'], ['1년 감가', 'resale'], ['연 유지비', 'upkeep']];
  const cell = (r, o, k) => {
    if (k === 'p') return { t: won(r.price), w: r.price < o.price };
    const x = A(r, k), y = A(o, k); if (!x) return null;
    let t = x[3];
    if (k === 'quiet') t = t.replace(/\s*\(.*\)/, '');
    if (k === 'accel') t = t.replace(/\s*\(.*\)/, '');
    if (k === 'eff') t = t;
    if (k === 'safety') t = (t.match(/Euro NCAP ★\d/) || t.match(/KNCAP \d등급/) || [t])[0] + (/IIHS TSP\+/.test(t) ? '<small>IIHS TSP+</small>' : /KNCAP/.test(t) && /Euro/.test(t) ? '<small>KNCAP 1등급</small>' : '');
    if (k === 'resale') t = '-' + (t.match(/평균 ([\d.]+%)/) || [, t])[1];
    if (k === 'upkeep') t = t.replace(/\s*\(.*\)/, '');
    return { t, w: y ? x[2] > y[2] : false };
  };
  const trs = spec.map(([lab, k]) => { const x = cell(a, b, k), y = cell(b, a, k); if (!x || !y) return ''; return `<div class="tr"><span class="x ${x.w ? 'w' : ''}">${x.t}</span><span class="k">${lab}</span><span class="x ${y.w ? 'w' : ''}">${y.t}</span></div>`; }).join('');
  const s3 = `<div class="h">실제 수치로 보면<small>▲ 초록 = 더 좋은 쪽</small></div>
<div class="names"><span>${esc(nm(a).split(' ').slice(0, 2).join(' '))}</span><span></span><span>${esc(nm(b).split(' ').slice(0, 2).join(' '))}</span></div>
<div class="card tbl">${trs}</div>
<div class="note" style="margin-top:22px">소음: 80km/h 실내 측정치 · 연비: 복합 공인 · 제로백: 실측 · 감가: 엔카 연식별 시세 기준 연평균 하락률</div>`;
  const s4 = `<div class="h">그래서 누구에게 맞을까?</div>
<div class="vd">${verdict.map(([who, pts]) => `<div class="card vb"><h4><span>${who}</span>를 고르세요</h4><ul>${pts.map((p) => `<li>${p}</li>`).join('')}</ul></div>`).join('')}</div>
<div class="note">카스쿼드 능력치는 공개 자료를 바탕으로 한 상대 평가예요. 구매 전에는 시승과 공식 가격표로 꼭 확인하세요.</div>`;
  const s5 = cta('여러분이라면<br>어느 쪽? 🤔', '댓글로 골라 주세요!<br>두 차 능력치 전체는 카스쿼드에서');
  return [s1, s2, s3, s4, s5];
}

// ---------- TOP
function topSlides(kick, title, sub, items, valFn, note) {
  const s1 = `<span class="kick">${kick}</span><div class="t1">${title}</div><div class="sub">${sub}</div>
<div class="card" style="margin-top:auto;padding:36px 40px;font-size:34px;font-weight:700;color:#dfe3ea;line-height:1.5">1위가 의외일 수도 있어요 👀<br><span class="gold">저장해 두고 차 고를 때 꺼내 보세요</span></div>`;
  const s2 = `<div class="h">${title.replace(/<br>/g, ' ')}</div><div class="tp">${items.map((r, i) => { const v = valFn(r); return `<div class="card ti"><span class="rk">${i + 1}</span><div class="nm">${esc(nm(r))}<small>${r.pt} · ${r.body} · ${won(r.price)} · OVR ${r.ovr}</small></div><div class="val"><b>${v[0]}</b><small>${v[1]}</small></div></div>`; }).join('')}</div>
<div class="note" style="margin-top:24px">${note}</div>`;
  const s3 = cta('내 조건에 맞는<br>순위가 궁금하다면', '예산 · 차급 · 연료로 걸러서<br>765종 순위를 바로 볼 수 있어요');
  return [s1, s2, s3];
}

// ---------- posts
const posts = [];
// 1 소개
{
  const r = by.dom41;
  const fc = `<div class="card fc"><div class="row"><div><div class="ov">${r.ovr}</div><div class="ol" style="font-size:24px;font-weight:800;letter-spacing:.14em;color:#a9afbb">OVR</div></div><div style="font-family:J;font-size:44px;color:#fff;line-height:1.2">${esc(nm(r))}</div></div>
<div class="ar">${G.map((k) => `<div><span>${k}</span><i><em style="width:${(r.groups[k] || 0) / 20 * 100}%;background:${col(r.groups[k])}"></em></i><b style="color:${col(r.groups[k])}">${Math.round(r.groups[k])}</b></div>`).join('')}</div></div>`;
  posts.push({ key: '01_소개', slides: [
    `<span class="kick">CAR SQUAD</span><div class="t1">차를<br><span class="gold">선수처럼</span><br>비교합니다</div><div class="sub">국산·수입차 765종을 축구 게임처럼<br>1~20 능력치로 매겨 봤어요.</div><div class="sub" style="margin-top:auto;font-size:32px">⚽ 감 말고 숫자로 고르는 차 계정</div>`,
    `<div class="h">이렇게 읽으면 돼요<small>소음·연비·가속·안전·감가 등 15개 능력치</small></div>${fc}
<div class="leg"><div><b style="color:#45d37f">16+</b><span>월드클래스</span></div><div><b style="color:#c8d758">11~15</b><span>주전급</span></div><div><b style="color:#e5a443">6~10</b><span>로테이션</span></div><div><b style="color:#e2554c">1~5</b><span>벤치</span></div></div>`,
    `<div class="h">사이트에서 할 수 있는 것</div><div class="feat">
<div class="card"><b>🏆</b><h5>765종 랭킹</h5><p>예산·차급·연료로 걸러서 OVR 순위</p></div>
<div class="card"><b>🎯</b><h5>3분 맞춤 추천</h5><p>몇 가지 질문으로 내 조건에 맞는 차</p></div>
<div class="card"><b>⚔️</b><h5>1:1 비교</h5><p>두 차 능력치를 나란히 놓고 비교</p></div>
<div class="card"><b>⚽</b><h5>내 스쿼드</h5><p>찜한 차로 축구·농구·야구 팀 짜기</p></div>
<div class="card"><b>🧠</b><h5>차 MBTI</h5><p>나랑 닮은 차, 내 성향 맞춤 차</p></div>
<div class="card"><b>🔁</b><h5>갈아타기 계산</h5><p>세금·부대비용·내 차 판매까지</p></div></div>`,
    cta('팔로우하고<br>차 고를 때 꺼내 보세요', '매주 VS 매치 · TOP 랭킹 · 차 MBTI<br>올라갑니다'),
  ] });
}
posts.push({ key: '02_VS_쏘렌토vs싼타페', slides: vsSlides('dom51', 'dom17', '쏘렌토 하이브리드<br>vs 싼타페 하이브리드', [
  ['쏘렌토', ['조용함·가속·안전 점수를 모두 챙기고 싶다면', '제로백 5.8초 vs 7.16초, 한 수 위 가속', 'Euro NCAP ★5 · 그룹 안전 점수 우위']],
  ['싼타페', ['2023년 풀체인지된 최신 모델을 원한다면', '각진 박스형 디자인이 취향이라면', '연비·유지비는 거의 똑같아서 부담 차이 없음']]]) });
posts.push({ key: '03_TOP_조용한SUV', slides: topSlides('TOP 5', '5천만 원 이하<br>가장 조용한 SUV', '80km/h로 달릴 때 실내 소음(dBA)이<br>낮은 순서예요. 1dB 차이도 체감됩니다.',
  ['dom89', 'dom54', 'dom58', 'dom50', 'dom95'].map((i) => by[i]), (r) => [A(r, 'quiet')[3].replace(/\s*\(.*\)/, ''), '80km/h 실내'], '국산 신차 · 같은 모델은 1개만 · 소음은 80km/h 실내 측정치(낮을수록 조용)') });
posts.push({ key: '04_VS_그랜저vsK8', slides: vsSlides('dom9', 'dom41', '그랜저 하이브리드<br>vs K8 하이브리드', [
  ['그랜저', ['연비 18.4km/ℓ로 한 걸음 더 아끼고 싶다면', '감가 방어(연 -6.8%)가 중요하다면', '국민 세단 상징성을 원한다면']],
  ['K8', ['조용함이 1순위라면 (57.2 vs 59.0dBA)', '약 900만 원 저렴하게 비슷한 급을 원한다면', '제동거리 38m, 그룹 안전 점수도 우위']]]) });
posts.push({ key: '05_TOP_연비왕', slides: topSlides('TOP 5', '국산 연비왕<br>(전기차 제외)', '공인 복합연비 기준으로<br>기름 덜 먹는 차 TOP 5예요.',
  ['dom1', 'dom46', 'dom12', 'dom38', 'dom45'].map((i) => by[i]), (r) => [A(r, 'eff')[3], '복합 공인연비'], '국산 신차 · 전기·수소차 제외 · 같은 연비면 OVR 높은 순') });
// 6 MBTI
{
  const dom = D.filter((r) => r.id.startsWith('dom') && r.ovr != null && !isNaN(r.ovr));
  const ex = (t) => { const seen = new Set(); return dom.filter((r) => r.mbti === t).sort((a, b) => b.ovr - a.ovr).map((r) => nm(r).split(' ').filter((w) => !/^\d+\.\d+T?$|kWh|HEV|^\(|롱레인지/.test(w)).join(' ')).filter((x) => { if (seen.has(x)) return false; seen.add(x); return true; }).slice(0, 2).join(', ') || '수입차 위주'; };
  const tile = (t) => `<div class="card mbt"><b>${t}</b><h6>${MB[t][0]}</h6><p>예) ${esc(ex(t))}</p></div>`;
  const types = Object.keys(MB);
  posts.push({ key: '06_차MBTI', slides: [
    `<span class="kick">CAR MBTI</span><div class="t1">나는 어떤<br>차 <span class="gold">체질</span>일까?</div><div class="sub">MBTI 16유형별로<br>어울리는 차를 골라 봤어요.</div><div class="sub" style="margin-top:auto;font-size:32px">👉 넘겨서 내 유형 찾기 · 친구 태그 환영</div>`,
    `<div class="h">차 MBTI 네 글자의 뜻</div><div class="ax">
<div class="card"><b>E / I</b><span><h5>달리는 재미 ↔ 조용한 편안함</h5><p>가속·성능을 즐기는지, 정숙성을 중시하는지</p></span></div>
<div class="card"><b>S / N</b><span><h5>검증된 실속 ↔ 새로운 기술</h5><p>익숙한 내연·하이브리드인지, 전기차·신기술인지</p></span></div>
<div class="card"><b>T / F</b><span><h5>숫자·가성비 ↔ 공간·안락함</h5><p>연비·유지비를 따지는지, 넓고 편한 게 우선인지</p></span></div>
<div class="card"><b>J / P</b><span><h5>안전·계획 ↔ 설렘·즉흥</h5><p>안전·신뢰가 먼저인지, 재미와 개성이 먼저인지</p></span></div></div>`,
    `<div class="h">16유형 도감 ①</div><div class="mbg">${types.slice(0, 8).map(tile).join('')}</div>`,
    `<div class="h">16유형 도감 ②</div><div class="mbg">${types.slice(8, 16).map(tile).join('')}</div>`,
    cta('24문항 테스트로<br>진짜 내 차 체질 찾기', '내 MBTI만 넣어도<br>예산별 맞춤 차를 바로 추천해 드려요'),
  ] });
}
posts.push({ key: '07_VS_스포티지vs그랑콜레오스', slides: vsSlides('dom49', 'dom96', '스포티지 하이브리드<br>vs 그랑 콜레오스 하이브리드', [
  ['스포티지', ['안전이 최우선이라면 (Euro NCAP ★5 · IIHS TSP+)', '약 470만 원 더 저렴하게', '연비 16.3km/ℓ로 근소하게 우위']],
  ['그랑 콜레오스', ['조용한 실내를 원한다면 (59.4 vs 60.3dBA)', '감가 방어 연 -6%로 되팔 때 유리', '제동거리 36.99m, 더 넉넉한 휠베이스']]]) });
posts.push({ key: '08_TOP_첫차', slides: topSlides('TOP 5', '3천만 원 이하<br>첫차 OVR 순위', '사회초년생 첫 차 고민 중이라면?<br>신차 3천만 원 이하 종합 능력치 순위예요.',
  ['dom0', 'dom93', 'dom11', 'dom34', 'dom20'].map((i) => by[i]), (r) => [`OVR ${r.ovr}`, won(r.price)], '국산 신차 기본가 기준 · 같은 모델은 1개만 · OVR은 15개 능력치 종합') });
// 9 퀴즈
{
  const Q = [
    ['80km/h에서 실내가 더 조용한 차는?', 'dom89', 'dom95', 'quiet', '디젤 SUV가 이겼어요! 렉스턴은 58.0dBA로 5천만 원 이하 SUV 중 실내가 가장 조용한 편이에요.'],
    ['1년에 시세가 덜 떨어지는 차는?', 'dom12', 'dom46', 'resale', '니로 하이브리드는 연평균 -5.7%, 코나 하이브리드는 -11%. 비슷한 값이라도 감가는 꽤 달라요.'],
    ['연비가 더 좋은 차는?', 'dom1', 'dom46', 'eff', '아반떼 하이브리드 21.2km/ℓ로 국산 연비왕! 세단이 SUV보다 공기저항에서 유리해요.'],
  ];
  const val = (r, k) => k === 'resale' ? '연 -' + A(r, k)[3].match(/평균 ([\d.]+%)/)[1] : A(r, k)[3].replace(/\s*\(.*\)/, '');
  const sl = [`<span class="kick">SCOUT QUIZ</span><div class="t1">능력치<br><span class="gold">퀴즈</span> 3문제</div><div class="sub">정답은 다음 장에 있어요.<br>몇 개 맞혔는지 댓글로 알려 주세요!</div><div class="sub" style="margin-top:auto;font-size:32px">🎯 3개 다 맞히면 수석 스카우트</div>`];
  Q.forEach(([q, a, b, k, why], i) => {
    const A1 = by[a], B1 = by[b];
    const win = A(A1, k)[2] >= A(B1, k)[2] ? A1 : B1;
    sl.push(`<span class="kick">Q${i + 1}</span><div class="qq">${q}</div><div class="qo"><div><b>A</b><h5>${esc(nm(A1))}</h5><p>${A1.pt} · ${A1.body}</p></div><div><b>B</b><h5>${esc(nm(B1))}</h5><p>${B1.pt} · ${B1.body}</p></div></div><div class="hint">생각했으면 넘겨서 정답 확인 👉</div>`);
    sl.push(`<span class="kick">A${i + 1} · 정답 ${win === A1 ? 'A' : 'B'}</span><div class="qq" style="font-size:56px">${q}</div><div class="qo">${[A1, B1].map((r, j) => `<div class="${r === win ? 'ok' : 'no'}"><b>${'AB'[j]}</b><h5>${esc(nm(r))}</h5><div class="vv">${val(r, k)}</div></div>`).join('')}</div><div class="card ex">💡 ${why}</div>`);
  });
  sl.push(cta('더 풀고 싶다면?', '사이트에서 매번 새로 나오는<br>10문제 능력치 퀴즈에 도전하세요'));
  posts.push({ key: '09_능력치퀴즈', slides: sl });
}

module.exports = { CSS, page, cta, esc, won, col, A, nm, by, LOGO, MB };
if (require.main === module) (async () => {
  fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  for (const post of posts) {
    const d = path.join(OUT, post.key); fs.mkdirSync(d);
    for (let i = 0; i < post.slides.length; i++) {
      const f = path.join(DIR, '_tmp.html');
      let body = post.slides[i];
      let html = page(body, i + 1, post.slides.length);
      if (body.startsWith('<div class="main cta"')) html = html.replace(`<div class="main">${body}</div>`, body.replace('style="position:static;height:100%;display:flex;flex-direction:column"', 'style="display:flex;flex-direction:column"'));
      fs.writeFileSync(f, html);
      await p.goto('file://' + f); await p.evaluate(() => document.fonts.ready);
      await p.screenshot({ path: path.join(d, String(i + 1).padStart(2, '0') + '.jpg'), type: 'jpeg', quality: 92 });
    }
    console.log(post.key, post.slides.length);
  }
  // 프로필 사진
  fs.writeFileSync(path.join(DIR, '_tmp.html'), `<!doctype html><html><body style="margin:0;width:1080px;height:1080px;background:#0f1115;display:flex;align-items:center;justify-content:center">${LOGO.replace('<svg', '<svg style="width:820px;height:820px"')}</body></html>`);
  await p.setViewportSize({ width: 1080, height: 1080 });
  await p.goto('file://' + path.join(DIR, '_tmp.html'));
  await p.screenshot({ path: path.join(OUT, '00_프로필사진.png') });
  await b.close();
})();
