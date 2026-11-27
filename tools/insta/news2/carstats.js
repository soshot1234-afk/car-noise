// 사이트에 아직 없는 신차의 카스쿼드 능력치(OVR·스타일·항목 점수)를 사이트 계산식 그대로 뽑기
// index.html 파일은 바꾸지 않고, 로컬 서버 응답에만 차 한 줄을 임시로 끼워 계산함
// 사용: 저장소 루트에서 python3 -m http.server 8765 & → node tools/insta/news2/carstats.js 차.json 결과.json
// 차.json 예: {"id":"tmpx","name":"뷰익 엘렉트라 E7","brand":"뷰익","origin":"수입","powertrain":"PHEV","body":"SUV","price":5299,
//   "fe":14.1,"fe_unit":"km/ℓ","len":4850,"wid":1910,"hei":1675,"wb":2850,"weight":1995,"cc":1498,"ps":224,"tq":33.7,"batt":31.7}
// 규칙: 공식 발표 숫자만 넣기. 결과 attrs의 5번째 값이 1(추정)인 항목은 인스타에 쓰지 않기. 순위(rank)는 자료가 적은 신차라 쓰지 않기.
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const [inp, outp] = process.argv.slice(2); const car = JSON.parse(fs.readFileSync(inp, 'utf8'));
  const b = await chromium.launch(); const p = await b.newPage();
  await p.route(/^(?!http:\/\/localhost)/, (r) => r.abort());
  await p.route('http://localhost:8765/', async (r) => {
    const res = await r.fetch(); const body = (await res.text()).replace(/window\.__CARS\s*=\s*\[/, (m) => m + JSON.stringify(car) + ',');
    r.fulfill({ response: res, body, headers: { ...res.headers(), 'content-type': 'text/html; charset=utf-8' } });
  });
  await p.goto('http://localhost:8765/'); await p.waitForFunction(() => window.__carroExport);
  const d = await p.evaluate((id) => window.__carroExport().find((x) => x.id === id), car.id);
  if (outp) fs.writeFileSync(outp, JSON.stringify(d, null, 1));
  console.log(JSON.stringify({ ovr: d.ovr, style: d.style, nreal: d.nreal })); d.attrs.forEach((a) => console.log(a.join(' | ')));
  await b.close();
})();
