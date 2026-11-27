// 예전 운영 주소(carsquad.pages.dev)로 오면 새 주소로 보냅니다.
// - 첫 화면(/)으로 오는 사람: 이 브라우저에 저장된 기록(내 차·스쿼드·오락실 등)을 담아 새 주소로 넘깁니다.
//   (기록은 주소마다 따로 저장되기 때문에, 그냥 넘기면 새 주소에서 빈 화면이 됩니다.)
// - 그 밖의 주소와 검색 로봇: 바로 영구 이동(301).
// 테스트 주소(dream-test.carsquad.pages.dev 등)는 그대로 둡니다.
const NEW_ORIGIN = 'https://carsquad.kr';
const OLD_HOSTS = ['carsquad.pages.dev', 'www.carsquad.kr'];
const BOT = /bot|crawl|spider|slurp|yeti|daum|facebookexternalhit|kakaotalk-scrap|preview/i;

const hopPage = (target) => `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>카스쿼드 새 주소로 이동 중</title>
<noscript><meta http-equiv="refresh" content="0;url=${target}"></noscript>
<style>body{margin:0;display:grid;place-items:center;min-height:100vh;background:#0f1115;color:#fff;font-family:-apple-system,"Apple SD Gothic Neo","Malgun Gothic",sans-serif}</style></head>
<body><p>카스쿼드가 <b>carsquad.kr</b>로 이사했어요. 잠시만요…</p>
<script>(function(){var T=${JSON.stringify(target)},d={},n=0;
try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i),v=localStorage.getItem(k);
if(k==='carro_photos_v1'||v==null||v.length>60000)continue;d[k]=v;n++;}}catch(e){}
var h=location.hash||'';
if(!n){location.replace(T+h);return;}
var s='';try{s=btoa(unescape(encodeURIComponent(JSON.stringify(d)))).replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=+$/,'');}catch(e){}
location.replace(T+(s?'#cs_move='+s+(h?'&cs_h='+encodeURIComponent(h.slice(1)):''):h));})();</script></body></html>`;

export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (!OLD_HOSTS.includes(url.hostname)) return next();
  const target = NEW_ORIGIN + url.pathname + url.search;
  const ua = request.headers.get('user-agent') || '';
  const isRoot = url.pathname === '/' || url.pathname === '/index.html';
  if (url.hostname === 'carsquad.pages.dev' && isRoot && request.method === 'GET' && !BOT.test(ua)) {
    return new Response(hopPage(target), { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
  }
  return Response.redirect(target, 301);
}
