// 사이트 데이터를 data2.json으로 내보내기 (gen.js·gen4.js가 사용)
// 사용: 저장소 루트에서 python3 -m http.server 8765 실행 후 → node tools/insta/export.js
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.route(/^(?!http:\/\/localhost)/, (r) => r.abort());
  await p.goto('http://localhost:8765/'); await p.waitForFunction(() => window.__carroExport);
  const d = await p.evaluate(() => window.__carroExport());
  fs.writeFileSync(path.join(__dirname, 'data2.json'), JSON.stringify(d));
  console.log('cars', d.length); await b.close();
})();
