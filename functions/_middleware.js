// 예전 운영 주소(carsquad.pages.dev)로 오면 새 주소로 영구 이동(301).
// 테스트 주소(dream-test.carsquad.pages.dev 등)는 그대로 둡니다.
const NEW_ORIGIN = 'https://carsquad.kr';
const OLD_HOSTS = ['carsquad.pages.dev', 'www.carsquad.kr'];

export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (OLD_HOSTS.includes(url.hostname)) {
    return Response.redirect(NEW_ORIGIN + url.pathname + url.search, 301);
  }
  return next();
}
