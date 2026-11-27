# CARSQUAD 인수인계서 v2 · 2026-11-19 (Claude 프로젝트 지식용)
# 기계가 읽기 좋은 YAML 형식. 작업 전에 이 문서 → 저장소 README/tools/insta/README.md 순서로 확인.

```yaml
meta:
  version: 2
  as_of: 2026-11-19 21:00 KST
  owner: {name: 동준, role: 기획·결정·최종승인 ("적용"), style: ENTJ·직설·비판 환영}
  reply: 한국어 존댓말 (진행 메시지 포함)
  previous_docs: [CARSQUAD_HANDOFF.md v1 (ChatGPT 협업용, 2026-11-19)]

identity:
  name: 카스쿼드 (CAR SQUAD)
  former_names: [차종별 비교(소음편), 카롱도르]
  concept: 국내 판매차(신차 + 이전 세대 중고)를 축구 게임 선수처럼 능력치·OVR로 보여 주는 비교 앱. "화장실·누워서 심심할 때 보는 앱". 차 몰라도 쉽고 재밌게 + 차로 하는 놀이.
  metaphor: {차: 선수, 가격: 몸값, 유지비: 연봉, 출시후햇수: 나이, 리콜: 부상빈도(표기는 '무상 점검'), 찜: 스쿼드}
  logo: 11인 스쿼드 게이지 — 점 11개 270° 호 + 바늘 + 금색 허브. 색 빨강 #e2554c / 주황 #e5a443 / 연두 #c8d758 / 초록 #45d37f / 금 #e3b448 / 바늘 크림(밝은 바탕에선 #15181e)
  fonts: {제목: 여기어때 잘난체(Jalnan), 본문: Pretendard, 숫자: Barlow Condensed}
  operator_persona: 차 많이 타 본 외근직·영업직 (동준 님 실제 경험 스토리)
  stage: 초창기(일 방문자 매우 적음) → 베타 테스트 기간

urls:
  live: https://carsquad.kr                   # Cloudflare Pages, main 자동 배포
  test: https://dream-test.carsquad.pages.dev # dream-test 브랜치
  test_looks: "https://dream-test.carsquad.pages.dev/?look=a|b|c|d|e  (off = 지금 화면)"
  look_branches: [look-a, look-b, look-c, look-d, look-e]   # dream-test와 같은 커밋 강제 push. 주소 look-a.carsquad.pages.dev (작동 미확인 → ?look 주소 권장)
  repo: https://github.com/soshot1234-afk/car-noise  (public, Claude GitHub 앱 push 권한 있음)
  instagram: "@car_squad2026"
  stats_backend: Google Apps Script 웹앱 + 구글 시트 (index.html의 window.CARRO_STATS_URL). 방문자·제보·한줄평·깡통봇 미답변 질문·차생 별점(동의 시). 시트 편집은 동준 님 계정만.
  search_console: [Google, Naver 소유확인 태그 index.html head]
  claude_docs:
    차생그래프_기획안: https://claude.ai/artifact/ATvks2k4KDfF4uXxVRakUw
    개편_기획안(39개 화면안·실측): https://claude.ai/artifact/V4W8m6LzvJ9tB8FKQVHrnt

architecture:
  type: 정적 단일 페이지 (vanilla JS, 빌드 없음)
  index.html: 앱 전체 약 2.4MB — HTML+CSS+JS+차 데이터(window.__CARS 한 줄 JSON)
  sw.js: "캐시 carro-vNN — main v24, dream-test v25. 운영 배포마다 +1"
  data: {count: 768, 이전세대(og:1): 298, fields: [id, name, brand, origin, powertrain, body, trim, price(만원), used_price, used_years, retention, fe, fe_unit, dba, noise_src, noise_raw, av_url, safety_text, safety_src, rec_n, rec_since, rec_rate, len, wb, seats, cc, batt, tax, photo, og, ex, "s_<attr> 1~20", _ovr, _rank(실행 시 계산), _e(추정 필드)]}
  id_prefix: {dom: 국산, de/oth: 수입, leg: 단종, f: 펀카}
  attributes: {피지컬: [accel, power, torque, brake, agile, eff, size], 멘탈: [quiet, qvalue, room, seats, cargo], 테크닉: [tinfo, tadas, tconv, safety], 히든: [durab(높을수록 리콜 많음=나쁨, gv()로 뒤집음), resale], 선수정보: [tage, pricev, upkeep, value]}
  helpers: [searchCars, shortName, modelKey, byId, activePool, ATTR, A, GROUPS, gv, isEst, el, btnEl, photo, openProfile, show, render, goPlay, commuteCost, style, carMBTI, topAttrs, recentList, rng, seedOf, todayKey, LS]
  hash: ["#tab=home|rank|play|prof|sq|wiz|cmp|fun|used|all|how", "&g=life|dg|wc|mb|qz|vid", "&p=<id>", "&c=a,b"]
  other_files: [trims.json(카동 트림), photos.json, car/*.html(SEO 765장, tools/build_seo.js), cars.html, sitemap.xml, logos/(제조사 로고, dream-test만)]
  tools: {qa/check.js: 7개 폭 넘침 검사(로컬서버 8765 필요, 오래 걸림), qa/kkang.js: 깡통봇 회귀, kkang/: 깡통봇 답변 DB, insta/: 인스타 생성기(README 필독), insta/suneung2026/: 수능 끝 특집 생성기, estimate.py, build_seo.js}
  local_test: "cd car-noise && python3 -m http.server 8765 → Playwright로 http://localhost:8765/?look=a#tab=home (외부 사진은 막혀서 빗금칸으로 보임)"

features_live (main):
  - 홈(오늘의 선수·뉴스·바로가기 타일: 📈 차생 그래프 NEW, 🏁 드림카까지 …)
  - 랭킹 / 선수(스카우트 리포트·탭바·비용·소음 듣기·트림·중고 링크·선수 카드 이미지·오너 한줄평) / 비교 / 스쿼드(축구·농구·야구 포지션) / 추천 / 펀카 / 이적시장 / 스카우트 / 기준
  - 놀이터: 차생 그래프(11/17), 첫차에서 드림카까지(11/15), 이상형 월드컵, 차 MBTI(24문항), 능력치 퀴즈, 리뷰 영상관
  - 깡통봇 베타(11/17): AI 아님. 데이터 검색·계산 + 미리 만든 답변, 답 없으면 질문 저장, 1인 1일 10문항
  - PWA, 관리자 모드

redesign (진행 중 · 최우선):
  why: 사용자 건의 — 글 많음·가독성, 누를 곳 많아 고민하다 끔, 첫 화면 검색, 정보와 놀이터 결이 다름
  measured_390px: {선수: "4,172자·14px미만 62%·버튼 81", 랭킹: "3,065자·버튼 214", 비교: "1,619자·14px미만 87%", 홈: "1,289자"}
  owner_constraints: [밝은 톤, 로고 색만, ☰ 메뉴 또는 경로 표시(뒤로뒤로 금지), 금색 밑줄 금지, 어디서 본·AI 같은 디자인 금지]
  options_made: 39개 화면안 (개편 기획안 문서). 동준 님 즐겨찾기: 계기판 클러스터, 3 선수 카드형, 14 두 갈래형, 19 다이얼형, 39 예산 속도계, 1 매거진, 9 아이콘 홈, 13 검색 한 줄
  test_versions (dream-test, ?look=):
    common: "상단 띠에서 A~E·지금 전환 / ☰ 왼쪽 메뉴(제조사별로 찾기 포함) + 🔍 검색 / 기존 탭줄·밴드 숨김 / 선수 화면은 새 상단 + '능력치·비용 전부 보기 ↓'로 기존 상세 펼침 / 제조사→모델→트림 단계 찾기(경로 표시, 국산·수입, 이전 세대 체크) / 제조사 로고"
    A_예산속도계+매거진: "홈=점 11개(1.5천~1억) 누르기 + −/+ 버튼, 신차·중고 시세 섞기(기본 신차 탭), 차종 칩, 결과 목록 OVR 미니 다이얼 / 선수=큰 사진·문장 3~4줄·숫자 3개·잘하는 것/아쉬운 것"
    B_두갈래+선수카드: "홈=검색 + 차 찾기/놀아 보기 / 차 찾기=제조사→모델→트림 | 예산·차종 조건(등급색 카드) / 선수=게임 카드, 뒤집으면 그룹 평균"
    C_계기판클러스터: "홈=오늘의 선수 OVR 다이얼 + 대표 강점 다이얼(눌러서 바꾸기) + 금색 노브 기어 P(놀이터)·R(최근 본 차)·N·D(제조사별 찾기) / 선수=사진 → 다이얼 2개 → 정보창 → 상태등 8개(하나 늘 선택, 선택 칸 색 채움+▼, 설명칸 같은 색)"
    D_아이콘홈(배민식): "홈=오늘은 뭐 타지? + 주간 배너 + 선 아이콘 8개 + 제조사 칩(로고) + 추천/많이 보는 차 / 카테고리 화면=탭+정렬+목록 / 선수=가게 페이지형(정보 카드·탭·메뉴판식 능력치)"
    E_검색한줄: "홈=로고+검색창+큰 예시 칸 4개 / 조건 해석(예산·차종·연료·7인승·국산수입·정렬 단어) '이렇게 찾았어요' 표시, 'A vs B' 맞대결 표 / 선수=답변 카드 + 이어서 물어보기(연비·무상 점검·안전·중고·같은 가격대·라이벌 비교)"
  code_location: "index.html 안 '새 화면 시안 (NL)' 블록 — NL 상태 객체, nlShell, nlHome(A~E), nlProfile(A~E), nlBrowse, nlGauge, NLLOGO, CSS는 '/* ===== 새 화면 시안 (NL) ===== */' (.vd.nl 접두사). 시안 꺼짐(기본)일 땐 기존 화면 그대로."
  feedback_history:
    - "C: 오른쪽 연비 고정 의문 → 대표 강점 자동+눌러서 바꾸기 / 기어 안 기어 같고 효과 없음 → 노브 슬라이드 / 계기판 보기 들어가면 사진 없음 → 사진 맨 위 / 상태등 눌러야 하는지 모름 → 선택 상태 강조"
    - "A: 바늘 끌기 불편 → 점 누르기·−+"
    - "D: 아이콘 AI·도트 같음 → 선 아이콘"
    - "E: 예시가 작음 → 큰 칸"
    - "전체: 엔카·헤이딜러처럼 제조사→차종→트림 → 구현"
  known_gaps:
    - 트림 이름이 데이터마다 제각각('84kWh(롱레인지)' 등) → 모델·트림 이름표 정리 필요(반나절)
    - 시안은 홈·선수 화면만. 랭킹·비교 등은 색만 밝아짐
    - E 조건 검색은 정해진 단어만 이해(AI 아님) — 깡통봇과 합칠지 결정 필요
    - 아직 '적용' 안 됨. 동준 님이 시안 고른 뒤 계획 세워 단계적으로

logos (dream-test):
  where: 제조사 선택 칸, 제조사 화면 머리, D 시안 제조사 칩만
  rules: 변형 없음(흑백 표시), 홍보물·인스타 사용 금지, 하단·메뉴에 상표 안내 문구
  sources: "logos/README.md — Simple Icons(CC0 데이터, SVG 29개) + car-logos-dataset(PNG 5개: 제네시스·렉서스·링컨·GMC·로터스). 제네시스는 흰 배경만 투명 처리"
  missing: [BYD(옛 로고라 제외), KGM, 지커, 이네오스] → 이름만
  legal_basis: "설명·지시 목적 사용은 상표의 사용 아님(대법원 2001도1355 등). 정리: https://www.nepla.ai/wiki/%EC%A7%80%EC%8B%9D%EC%9E%AC%EC%82%B0/%EC%83%81%ED%91%9C/%EC%83%81%ED%91%9C%EC%9D%98-%EC%82%AC%EC%9A%A9-%EC%83%81%ED%91%9C%EC%A0%81-%EC%82%AC%EC%9A%A9-2w0ndvwjnj7d — 변호사 검토 아님"

instagram:
  cadence: {목 20~21시: VS, 일 10시: MBTI/TOP, 화: 이번 주 차 소식(뉴스)}
  posted_list: tools/insta/posted.md (중복 금지 — 새 주제 전에 확인, 만든 뒤 추가)
  rules: tools/insta/README.md (어두운 톤, 실측·공식 숫자만, ✏️ 줄, 해시태그 6개 #카스쿼드)
  news_rules: 1차 출처만, 루머·스파이샷·출시예정 금지, 자극 제목 금지, 확인 2건 미만이면 쉼, 리콜=무상 점검 안내(자동차리콜센터 공시 문구 범위)
  recent_made:
    - "11/18 수능 응원 4장, 패치노트 이미지(차생·MBTI)"
    - "11/19 수능 끝 특집: 게시물1 수험생 수고(3장) / 게시물2 같이 달려 주신 분(3장) / 게시물3 첫 차(캐스퍼·레이·아반떼·아반떼 HEV)+조용한 차(그랜저 2.5 57.0dBA·GV70 3.5T 57.1·K8 HEV 57.2·그랑 콜레오스 59.4)(10장) + 릴스 4개·합본(44.9초, 끝 장면 1회). 생성기 tools/insta/suneung2026 (node posts3.js / node reels.js 릴스). 업로드 여부 미확인"
  reel_engine: "HTML 장면 + window.render(t) → Playwright 프레임 캡처 → ffmpeg(libx264 veryfast crf 20). 끝 장면: 메시지 → 로고 계기판 점등 → CAR SQUAD → '프로필 링크에서 만나요' 버튼, 1초 정지"
  lessons: ["한 게시물 18장은 너무 많음 → 10장 이하", "릴스 끝이 뚝 끊기면 애매 → 마무리 장면+정지", "릴스는 15초 안팎이 좋음"]

roles:
  동준: 기획·결정·사진 수급·지인 인터뷰·인스타 업로드·✏️ 한마디·"적용"
  Claude(대화): 개발·배포·데이터·QA·기획안·시안·인스타 이미지/릴스/캡션
  AI_staff (예약 작업, 매번 새 세션, 결과는 휴대폰 알림):
    - {id: trig_01RNNJXeByB84aif5PPdngps, name: 데이터 담당, when: 화 09:47, does: 가격·신차·리콜 대조 → data-update-날짜 브랜치(운영 반영 금지)}
    - {id: trig_0177TEtGtTEGeMQBLSjrX9SV, name: 뉴스 담당, when: 월 19:41, does: 이번 주 차 소식 카드 zip + tools/insta/news 커밋}
    - {id: trig_01DnydmHP5PRjaNdmn7fihg5, name: 콘텐츠 담당, when: 수 20:49, does: 목요일 VS 3안+TOP 1안 zip, posted.md 후보 기록}
    - {id: trig_01WQgYd7FWw2mqNvpNa5nkUr, name: 개발 담당, when: 금 14:47, does: check.js·kkang.js·스크린샷·미니게임 2판 점검, 고칠 건 dream-test}
    - {id: trig_011u1uGgHv2Gge1qNqgJ4vm9, name: 인스타 알림 VS, when: 목 19:47}
    - {id: trig_01Eqtky37n7eWqqA3LBPf2LP, name: 인스타 알림 MBTI, when: 일 09:47}
  ChatGPT: 협업 제안 상태(v1 인수인계서 전달). 저장소 push 불가 → 제안은 동준 님 통해 Claude가 반영

git_state (2026-11-19 21:00):
  main: bbc994a (v24, 차생 그래프 포함)
  dream-test: 418667a — main + 시안 A~E + 로고 + 수능 생성기 (v25). 운영 미반영
  deploy_check: "gh api repos/soshot1234-afk/car-noise/commits/<sha>/check-runs (이름에 carsquad) → completed success"
  after_push: "git fetch -q origin \"+refs/heads/dream-test:refs/remotes/origin/dream-test\" (추적 ref 갱신, 안 하면 미push로 오인)"
  apply_procedure: "동준 님 '적용' → dream-test 내용을 main에 반영(머지), sw.js 버전 확인, UPDATES 기록, push, 배포 확인. 시안(NL)은 ?look 없으면 안 보이므로 함께 올라가도 운영 화면은 그대로"

open_items (우선순위 순):
  1. 시안 A~E 중 방향 결정 → 랭킹·비교까지 같은 언어로 확장, 트림 이름 정리
  2. 수능 특집 업로드(오늘 1·2, 주말 3 추천)
  3. 0단계: 화면별 조회 기록(개편 근거 데이터)
  4. 한줄평·질문 등록 시 휴대폰 알림(텔레그램 봇 등)
  5. 리콜 정보 ↔ 사이트 연결 방식
  6. 가격·중고 시세 갱신(동준 님 PC 필요)
  7. 깡통봇 미답변 질문 → 답변 DB 갱신 담당
  8. 인스타툰(별도 계정, 그림은 Claude), 1인칭 POV 유튜브, 2주 마케팅 우선순위

known_risks:
  - index.html 단일 2.4MB(로딩·충돌)
  - 점수 상당수 추정·자체 정규화 → 출처·추정 표시 유지
  - 리콜(부상빈도) 표현 리스크
  - 정보 앱 vs 놀이 앱 정체성 분산
  - 사용자 표본이 지인 위주
```

## 새 대화에서 이어 갈 때 첫 순서 (Claude용)
1. 이 문서와 프로젝트 지침을 읽는다.
2. 저장소가 필요하면 `soshot1234-afk/car-noise`를 연결(add_repo)하고 clone한 뒤 `git checkout dream-test`를 실행한다.
3. 동준 님이 말한 작업이 시안 관련이면 `?look=` 주소와 index.html의 NL 블록에서 시작한다.
4. 바꾸기 전에 먼저 상의한다. 만든 건 dream-test에 올리고 테스트 주소와 함께 보고한다. 운영 반영은 "적용"이라고 할 때만 한다.
