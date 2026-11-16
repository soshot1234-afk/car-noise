const { chromium } = require('playwright'); const fs=require('fs');
(async () => { const b = await chromium.launch(); const p = await b.newPage();
await p.route(/wikimedia|wikipedia|google|ytimg|youtube/, (r) => r.abort());
await p.goto('http://localhost:8765/#tab=rank'); await p.waitForTimeout(2500);
const d = await p.evaluate(() => { const E = window.__carroExport(); const C = window.__CARS; const by = Object.fromEntries(C.map(r=>[r.id,r]));
  return E.map(e => ({...e, raw: (({uy,spec_src,fe,fe_unit,dba,safety_text,rec_n,rec_since,rec_status,used_years,retention,len,wb,seats,trunk,ps,weight,tax,batt,range,trim})=>({uy,spec_src,fe,fe_unit,dba,safety_text,rec_n,rec_since,rec_status,used_years,retention,len,wb,seats,trunk,ps,weight,tax,batt,range,trim}))(by[e.id])})); });
fs.writeFileSync(__dirname+'/cars.json', JSON.stringify(d)); console.log(d.length); await b.close(); })();
