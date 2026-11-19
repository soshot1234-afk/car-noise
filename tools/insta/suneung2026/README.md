# 수능 끝 특집 (2026-11-19)

- `node posts3.js` → out/게시물3개/ (게시물1 수험생 3장 · 게시물2 같이 달려 주신 분 3장 · 게시물3 첫 차+조용한 차 10장)
- `node posts.js` → 4종 따로 (옛 구성)
- `node reels.js 릴스` → out/릴스_1~4.mp4 (각자 끝 장면 포함)
- `node reels.js 릴스 cut && node reels.js outro cut` → cut/ 폴더, 그다음 ffmpeg concat으로 합본 (끝 장면은 outro 한 번만)
- 출력물(jpg·mp4)은 저장소에 올리지 않아요. 캡션은 `캡션.txt`.
- 차 숫자는 사이트 데이터(2026-11) 기준. 다시 만들 땐 사이트 값과 대조하세요.
