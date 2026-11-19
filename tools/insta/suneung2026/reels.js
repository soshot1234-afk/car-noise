// 수능 끝 릴스 4종 (1080x1920, 30fps) → out/릴스_*.mp4
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'); const { execSync } = require('child_process');
const D = __dirname, FPS = 30;
const LOGO = fs.readFileSync(path.join(D, 'logo.svg'), 'utf8');
const F = '/home/claude/car-noise/tools/insta/fonts';
const C = { R: '#e2554c', O: '#e5a443', L: '#c8d758', G: '#45d37f', GOLD: '#e3b448' };
const dots = (id, size) => { const cols = [C.R, C.R, C.R, C.O, C.O, C.L, C.L, C.L, C.G, C.G, C.G]; let s = `<svg viewBox="0 0 200 200" width="${size}" height="${size}">`; for (let i = 0; i < 11; i++) { const a = (135 + i * 27) * Math.PI / 180; s += `<circle class="${id}d" data-c="${cols[i]}" cx="${(100 + 76 * Math.cos(a)).toFixed(1)}" cy="${(100 + 76 * Math.sin(a)).toFixed(1)}" r="13" fill="#2c3446"/>`; } return s + `<line id="${id}n" x1="100" y1="100" x2="100" y2="46" stroke="#f4efe2" stroke-width="9" stroke-linecap="round"/><circle cx="100" cy="100" r="14" fill="${C.GOLD}"/></svg>`; };
const CAR = { 경차: '<path d="M70 150v-40l25-45h110l25 45v40" /><path d="M95 108h140M150 65v43"/><circle cx="105" cy="152" r="20"/><circle cx="215" cy="152" r="20"/>', 세단: '<path d="M20 150v-30l40-10 45-45h100l50 45 45 10v30"/><path d="M105 110h150"/><circle cx="85" cy="152" r="20"/><circle cx="235" cy="152" r="20"/>', SUV: '<path d="M25 150v-40l30-55h170l45 55h25v40"/><path d="M60 108h235M150 55v53"/><circle cx="90" cy="152" r="20"/><circle cx="240" cy="152" r="20"/>' };
const car = (b, w) => `<svg viewBox="0 0 320 180" width="${w}" fill="none" stroke="#e3b448" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">${CAR[b]}</svg>`;
const css = `@font-face{font-family:J;src:url(${F}/yg-jalnan.woff2)}@font-face{font-family:P;src:url(${F}/PretendardVariable.woff2);font-weight:100 900}
*{margin:0;padding:0;box-sizing:border-box}body{width:1080px;height:1920px;background:radial-gradient(110% 60% at 50% 0%,#26304a 0%,#0f1115 60%);color:#fff;font-family:P;overflow:hidden;position:relative;word-break:keep-all}
.chk{position:absolute;inset:0;background-image:conic-gradient(#fff 25%,transparent 0 50%,#fff 0 75%,transparent 0);background-size:120px 120px;opacity:.035}
.bar{position:absolute;left:0;right:0;bottom:0;height:18px;background:linear-gradient(90deg,#e2554c 0 25%,#e5a443 25% 50%,#c8d758 50% 75%,#45d37f 75%)}
.sc{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;opacity:0;padding:0 80px}
.j{font-family:J;font-weight:400}.q{font-size:112px;line-height:1.2}.gold{color:#e3b448}
.sub{font-size:50px;color:#c9ced7;font-weight:700;line-height:1.5;margin-top:40px}
.tag{font-size:40px;font-weight:900;color:#15181e;background:#e3b448;border-radius:999px;padding:14px 34px;margin-bottom:34px}
.odo{display:flex;gap:16px;margin-top:40px}.odo i{font-style:normal;width:150px;height:200px;border-radius:24px;background:#0a0c10;border:3px solid #2c3446;display:grid;place-items:center;font-family:J;font-size:150px}
.w{font-size:62px;font-weight:900;background:#1b2029;border:2px solid #2f3746;border-radius:30px;padding:30px 46px;margin:18px 0;display:flex;gap:24px;align-items:center}
.card{width:920px;background:#171b23;border:2px solid #2a3140;border-radius:48px;padding:60px;text-align:left;display:flex;flex-direction:column;gap:20px}
.nm{font-size:84px;line-height:1.15}
.row{display:flex;justify-content:space-between;align-items:center}
.big{font-family:J;font-size:150px;line-height:1}
.lb{font-size:38px;font-weight:800;color:#8a93a6}
.qb{width:920px;display:flex;flex-direction:column;gap:34px;text-align:left}
.qr{display:grid;grid-template-columns:330px 1fr 190px;align-items:center;gap:20px}
.qr span{font-size:44px;font-weight:900}.qr i{height:44px;border-radius:22px;background:#262c38;position:relative;overflow:hidden}.qr i em{position:absolute;left:0;top:0;bottom:0;border-radius:22px;background:#45d37f}
.qr b{font-family:J;font-weight:400;font-size:62px;text-align:right}
.logo svg{width:300px;height:300px}
.foot{position:absolute;left:0;right:0;bottom:110px;text-align:center;font-size:34px;font-weight:800;color:#7f889c}`;
const HEAD = `const E=(x)=>x<0?0:x>1?1:1-Math.pow(1-x,3);const seg=(t,a,b)=>E((t-a)/(b-a));
const show=(id,t,a,b,f=.3)=>{const el=document.getElementById(id);let o=0;if(t>=a&&t<=b){o=Math.min(1,(t-a)/f,(b-t)/f)}el.style.opacity=Math.max(0,o);return el};
const gauge=(id,f)=>{document.querySelectorAll('.'+id+'d').forEach((c,i)=>{c.setAttribute('fill',i<=Math.round(f*10)&&f>0.001?c.dataset.c:'#2c3446')});const a=(135+f*270)*Math.PI/180;const n=document.getElementById(id+'n');n.setAttribute('x2',100+54*Math.cos(a));n.setAttribute('y2',100+54*Math.sin(a));};
const pop=(el,t,a)=>{el.style.transform='scale('+(.9+.1*seg(t,a,a+.4))+')'};
const fmt=(n)=>Math.round(n).toLocaleString('en-US');
const endA=(t,a)=>{const e=show('end',t,a,999);const m=document.getElementById('emsg');const k=seg(t,a,a+.45);m.style.transform='translateY('+(50*(1-k))+'px)';m.style.opacity=k;
gauge('eg',seg(t,a+.5,a+1.8)*.92);['ewm','esub'].forEach((id,i)=>{const kk=seg(t,a+1.5+i*.25,a+1.95+i*.25);const el=document.getElementById(id);el.style.opacity=kk;el.style.transform='translateY('+(30*(1-kk))+'px)'});
const c=document.getElementById('ecta');const kc=seg(t,a+2.3,a+2.7);c.style.opacity=kc;c.style.transform='scale('+(.85+.15*kc)+')';};`;
const END = (a) => `<div id="end" class="sc"><div class="q j" id="emsg" style="font-size:92px;margin-bottom:70px">${a}</div><div>${dots('eg', 300)}</div><div id="ewm" class="j" style="font-size:84px;margin-top:26px;letter-spacing:.02em">CAR SQUAD</div><div id="esub" class="sub" style="margin-top:14px;font-size:44px">차를 선수처럼, 내 팀처럼</div><div id="ecta" style="margin-top:56px;font-size:44px;font-weight:900;color:#15181e;background:#e3b448;border-radius:999px;padding:22px 48px">프로필 링크에서 만나요 →</div></div>`;

const reels = {
  '릴스_1_수험생_수고했어요': { dur: 13.6, ea: 9.5, html: `
<div id="s1" class="sc"><div class="tag">2027학년도 수능</div><div class="q j">수능 <span class="gold">끝!</span></div><div class="sub">수험생 여러분</div></div>
<div id="s2" class="sc">${dots('g', 460)}<div class="odo"><i id="o1">0</i><i id="o2">0</i><i style="width:auto;padding:0 34px;font-size:90px">년</i></div><div class="sub" id="s2t">초·중·고 12년, <span class="gold">완주!</span></div></div>
<div id="s3" class="sc"><div class="q j">오늘 진짜<br><span class="gold">수고했어요</span></div><div class="sub">점수가 어떻든<br>끝까지 앉아 있었던 거, 그걸로 충분해요</div></div>
${END('하고 싶었던 거<br><span class="gold">전부</span> 응원해요')}`,
    js: `window.render=(t)=>{const s1=show('s1',t,0,2.6);pop(s1,t,0);
const s2=show('s2',t,2.7,6.6);const k=seg(t,3,5.2);gauge('g',k);const n=Math.round(12*k);document.getElementById('o1').textContent=String(n).padStart(2,'0')[0];document.getElementById('o2').textContent=String(n).padStart(2,'0')[1];document.getElementById('s2t').style.opacity=seg(t,5.2,5.6);
const s3=show('s3',t,6.7,9.4);pop(s3,t,6.7);endA(t,9.5);}` },
  '릴스_2_케어해주신분들_수고하셨어요': { dur: 13.6, ea: 9.5, html: `
<div id="s1" class="sc"><div class="sub" style="margin:0 0 40px;font-size:56px">수험생 뒤에는</div><div class="w" id="w0">🍱 새벽 도시락</div><div class="w" id="w1">🚗 밤 10시 학원 픽업</div><div class="w" id="w2">🤐 꾹 참은 잔소리</div></div>
<div id="s2" class="sc"><div class="q j" style="font-size:100px">옆에서 같이<br>달려 주신 분들도<br><span class="gold">수고 많으셨어요</span></div><div class="sub">부모님 · 선생님 · 가족 · 친구</div></div>
<div id="s3" class="sc"><div id="cr">${car('세단', 640)}</div><div class="q j" style="margin-top:60px;font-size:100px">오늘만큼은<br><span class="gold">조수석</span>에 앉으세요</div></div>
${END('그동안<br><span class="gold">고생 많으셨어요</span>')}`,
    js: `window.render=(t)=>{show('s1',t,0,3.6);for(let i=0;i<3;i++){const w=document.getElementById('w'+i);const k=seg(t,.3+i*.6,.8+i*.6);w.style.opacity=k;w.style.transform='translateY('+(60*(1-k))+'px)'}
const s2=show('s2',t,3.7,6.4);pop(s2,t,3.7);show('s3',t,6.5,9.4);document.getElementById('cr').style.transform='translateX('+(-900*(1-seg(t,6.5,7.4)))+'px)';
endA(t,9.5);}` },
  '릴스_3_새내기_첫차후보': { dur: 15.4, ea: 11.3, cars: [['경차', '제일 부담 없는', '현대 뉴 캐스퍼 1.0', 1792, 50, '연비 14.3km/ℓ'], ['경차', '경차인데 넓은', '기아 더 뉴 레이 1.0', 1955, 50, '연비 12.9km/ℓ'], ['세단', '국민 첫 차', '현대 디 올 뉴 아반떼 2.0', 2771, 62, '연비 14.3km/ℓ · KNCAP 1등급'], ['세단', '기름값 아끼는', '아반떼 하이브리드 1.6', 3261, 66, '연비 21.2km/ℓ · KNCAP 1등급']] },
  '릴스_4_고생하신분들께_조용한차': { dur: 14.5, ea: 10.4, html: `
<div id="s1" class="sc"><div class="sub" style="margin:0 0 30px;font-size:56px">수험생 뒷바라지 끝!</div><div class="q j">고생한 나에게<br><span class="gold">조용한 차</span></div></div>
<div id="s2" class="sc"><div class="sub" style="margin:0 0 20px">실내 소음 (80km/h · 낮을수록 조용)</div><div class="qb">
${[['그랜저 2.5', 57.0], ['GV70 3.5T', 57.1], ['K8 하이브리드', 57.2], ['그랑 콜레오스', 59.4]].map(([n, v], i) => `<div class="qr"><span>${n}</span><i><em id="q${i}" data-v="${v}"></em></i><b id="qv${i}">0</b></div>`).join('')}
</div><div class="sub" style="font-size:34px;margin-top:40px;color:#7f889c">오토뷰 80km/h 실측 · dBA</div></div>
<div id="s3" class="sc"><div class="q j" style="font-size:104px">3dB만 낮아도<br>소리 에너지는<br><span class="gold">절반</span></div><div class="sub">시승할 땐 라디오 끄고<br>80km/h에서 들어 보세요</div></div>
${END('운전석도<br><span class="gold">편해야죠</span>')}`,
    js: `window.render=(t)=>{const s1=show('s1',t,0,2.6);pop(s1,t,0);show('s2',t,2.7,7.4);for(let i=0;i<4;i++){const e=document.getElementById('q'+i);const v=+e.dataset.v;const k=seg(t,3+i*.35,4.4+i*.35);e.style.width=(((65-v)/10)*100*k)+'%';e.style.background=v<58?'#45d37f':'#c8d758';document.getElementById('qv'+i).textContent=(v*k).toFixed(1)}
const s3=show('s3',t,7.5,10.3);pop(s3,t,7.5);endA(t,10.4);}` }
};
reels['outro'] = { dur: 4.2, html: END('수고한 모두를<br><span class="gold">응원해요</span>'), js: 'window.render=(t)=>{endA(t,0)}' };
// 3번 릴스 장면 만들기
{ const R = reels['릴스_3_새내기_첫차후보']; const cs = R.cars;
  R.html = `<div id="s1" class="sc"><div class="sub" style="margin:0 0 30px;font-size:56px">면허 따면</div><div class="q j">첫 차는<br><span class="gold">뭐 타지?</span></div></div>` +
    cs.map(([b, tag, nm, p, o, x], i) => `<div id="c${i}" class="sc"><div class="card"><div class="row"><span class="tag" style="margin:0">${tag}</span><span class="lb">${i + 1} / 4</span></div><div class="nm j">${nm}</div><div>${car(b, 420)}</div><div class="row"><div><div class="lb">몸값</div><div class="big"><span id="p${i}">0</span><span style="font-size:60px">만</span></div></div><div style="display:flex;flex-direction:column;align-items:center">${dots('g' + i, 250)}<div class="lb">OVR <b id="ov${i}" style="color:#fff">0</b></div></div></div><div class="lb" style="color:#c9ced7">${x}</div></div></div>`).join('') + END('자세한 비교는<br><span class="gold">카스쿼드</span>에서');
  R.js = `const CS=${JSON.stringify(cs.map((c) => [c[3], c[4]]))};window.render=(t)=>{const s1=show('s1',t,0,2.3);pop(s1,t,0);CS.forEach(([p,o],i)=>{const a=2.4+i*2.2;const s=show('c'+i,t,a-.12,a+2.25,.15);s.style.transform='translateX('+(120*(1-seg(t,a,a+.35)))+'px)';const k=seg(t,a+.2,a+1.2);document.getElementById('p'+i).textContent=fmt(p*k);document.getElementById('ov'+i).textContent=Math.round(o*k);gauge('g'+i,o/100*k)});endA(t,11.3);}`; }

(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  ['out', 'cut'].forEach((x) => fs.mkdirSync(path.join(D, x), { recursive: true }));
  const only = process.argv[2]; const CUT = process.argv[3] === 'cut';
  for (const [name, R] of Object.entries(reels)) {
    if (only && !name.includes(only)) continue;
    const FR = path.join(D, 'frames_' + name); fs.rmSync(FR, { recursive: true, force: true }); fs.mkdirSync(FR);
    const f = path.join(D, '_r.html');
    fs.writeFileSync(f, `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body><div class="chk"></div>${R.html}<div class="bar"></div><script>${HEAD}${R.js}</script></body></html>`);
    await p.goto('file://' + f); await p.evaluate(() => document.fonts.ready);
    const N = Math.round((CUT && R.ea ? R.ea : R.dur) * FPS);
    for (let i = 0; i < N; i++) { await p.evaluate((t) => window.render(t), i / FPS); await p.screenshot({ path: path.join(FR, String(i).padStart(4, '0') + '.jpg'), type: 'jpeg', quality: 88 }); }
    execSync(`ffmpeg -y -loglevel error -framerate ${FPS} -i ${FR}/%04d.jpg -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p -movflags +faststart "${path.join(D, CUT ? 'cut' : 'out', name + (CUT ? '_cut' : '') + '.mp4')}"`);
    fs.rmSync(FR, { recursive: true, force: true });
    console.log(name, N);
  }
  await b.close();
})();
