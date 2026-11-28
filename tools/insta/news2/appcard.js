// 우리 앱(카스쿼드)의 '📇 선수 카드 공유' 이미지와 선수 화면을 그대로 뽑기 — 사이트에 아직 없는 신차용
// index.html 파일은 바꾸지 않고, 로컬 서버 응답에만 차 한 줄을 임시로 끼워 앱이 직접 카드를 그리게 함
// 사진은 앱의 '관리자 사진' 기능(localStorage carro_photos_v1)에 공식 보도사진 경로를 넣어 사용
// 사용: 저장소 루트에서 python3 -m http.server 8765 & →
//   node tools/insta/news2/appcard.js 차.json 사진경로(저장소 기준) 출력폴더
// 결과: 출력폴더/card.png (앱 선수 카드 1080×1350), 출력폴더/screen.png (앱 선수 화면, 폭 430)
// 앱에 이미 있는 차: 차.json = {"id":"dom103","name":"(앱의 이름 그대로)","existing":true} → 앱 데이터 그대로, 사진만 공식 보도사진으로
// 규칙: 차.json에는 공식 발표 숫자만. id는 'tmp'로 시작. 순위가 붙지 않도록 ex:true를 넣음(자료가 적은 신차라 순위 비교가 공정하지 않음)
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const [inp, photo, out] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  const raw = JSON.parse(fs.readFileSync(inp, 'utf8')); const car = raw.existing ? raw : Object.assign({ ex: true }, raw); // existing:true = 앱에 이미 있는 차(id·name만), 끼워 넣지 않음
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 430, height: 1800 }, deviceScaleFactor: 2.5, acceptDownloads: true });
  await ctx.addInitScript(([name, url]) => { try { localStorage.setItem('carro_photos_v1', JSON.stringify({ [name]: { url } })); } catch (e) {} }, [car.name, 'http://localhost:8765/' + photo]);
  const p = await ctx.newPage();
  await p.route(/^(?!http:\/\/localhost)/, (r) => r.abort());
  await p.route('http://localhost:8765/', async (r) => {
    const res = await r.fetch(); if (car.existing) return r.fulfill({ response: res });
    const body = (await res.text()).replace(/window\.__CARS\s*=\s*\[/, (m) => m + JSON.stringify(car) + ',');
    r.fulfill({ response: res, body, headers: { ...res.headers(), 'content-type': 'text/html; charset=utf-8' } });
  });
  await p.goto('http://localhost:8765/#tab=prof&p=' + car.id); await p.waitForTimeout(3000);
  await p.screenshot({ path: path.join(out, 'screen.png') });
  // 앱의 선수 카드 공유 버튼을 눌러 앱이 그린 카드 이미지를 받음
  const dl = p.waitForEvent('download', { timeout: 15000 }).catch(() => null);
  await p.getByText('📇 선수 카드 공유').first().click();
  const d = await dl;
  if (d) await d.saveAs(path.join(out, 'card.png'));
  else {
    await p.waitForSelector('.cardov img', { timeout: 15000 });
    const data = await p.evaluate(async () => { const im = document.querySelector('.cardov img'); const bl = await fetch(im.src).then((x) => x.blob()); return await new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(bl); }); });
    fs.writeFileSync(path.join(out, 'card.png'), Buffer.from(data.split(',')[1], 'base64'));
  }
  console.log('ok'); await b.close();
})();
