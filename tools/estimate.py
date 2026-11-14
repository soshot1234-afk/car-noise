#!/usr/bin/env python3
"""카스쿼드 빈칸 추정기

index.html 안의 window.__CARS 를 읽어서, 실측·공식 값이 없는 칸을 추정하고
window.__EST = {...} 블록으로 index.html 에 다시 써 넣는다.

  python3 tools/estimate.py            # 추정 + index.html 반영
  python3 tools/estimate.py --report   # 교차검증 오차만 출력

추정 방식 (우선순위)
  1) 형제차 준용: 같은 엔카 모델·같은 동력의 다른 트림에 실측값이 있으면 그대로 빌려 옴
  2) 제원 기반 예측: 실측값이 있는 차들로 회귀 모델을 학습해 무게·출력·차체·가격·동력·연식으로 예측
  3) 동급 평균: 위 둘 다 어려우면 같은 브랜드·차급 평균

추정값은 항상 '추정' 표시가 붙고, 앱에서 OVR 에 낮은 비중으로만 들어간다.
"""
import json, re, sys, math, os
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import KFold

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML = os.path.join(ROOT, 'index.html')
NOWY = 2026
REPORT = '--report' in sys.argv

src = open(HTML, encoding='utf-8').read()
a = src.index('window.__CARS=') + len('window.__CARS=')
cars, end = json.JSONDecoder().raw_decode(src[a:])
by = {r['id']: r for r in cars}


def num(v):
    try:
        x = float(v)
        return x if math.isfinite(x) else None
    except (TypeError, ValueError):
        return None


EST = {r['id']: {} for r in cars}   # id -> {field: [value, source, conf]}
META = {}  # field -> 교차검증 평균 오차


def put(r, f, v, how, conf):
    if v is None or (isinstance(v, float) and not math.isfinite(v)):
        return
    EST[r['id']][f] = [round(float(v), 2), how, conf]


def val(r, f):
    e = EST[r['id']].get(f)
    v = num(r.get(f))
    return v if v is not None else (e[0] if e else None)


# ---------------------------------------------------------------- 연식(세대·페이스리프트) 추정
def tech_year(r):
    """엔카 모델(페이스리프트 단위) 매물의 가장 이른 연식 = 이 세대/부분변경이 나온 해."""
    m = re.search(r'(\d{4})~(\d{4})', r.get('gyears') or r.get('gen') or '')
    if m:
        return int(m.group(1)), '세대 연식(엔카)'
    uy = r.get('uy') or []
    tot = sum(x[1] for x in uy) or 0
    for y, n, *_ in sorted(uy):
        if n >= 2 and n >= 0.03 * tot:
            return int(y), '엔카 첫 매물 연식'
    if r.get('legend') and r.get('disc'):
        return int(r['disc']) - 5, '단종 연도 기준 추정'
    if uy:
        return int(sorted(uy)[0][0]), '엔카 첫 매물 연식'
    return NOWY - 1, '신차(매물 없음) 추정'


for r in cars:
    y, how = tech_year(r)
    r['_ty'] = y
    EST[r['id']]['ty'] = [y, how, '높음' if '엔카' in how else '중간']

# ---------------------------------------------------------------- 공통 특징
BODIES = ['SUV', '세단', '해치백', '쿠페', '컨버터블', 'MPV', '경차', '픽업']
PTS = ['가솔린', '디젤', '전기', '하이브리드', 'PHEV', 'LPG', '수소전기']
PREMIUM = {'벤츠', 'BMW', '아우디', '제네시스', '렉서스', '포르쉐', '볼보', '랜드로버', '링컨', '캐딜락', '마세라티', '벤틀리', '롤스로이스', '페라리', '람보르기니', '맥라렌', '애스턴마틴', '로터스', '폴스타', '테슬라', '마이바흐'}


def famkey(r):
    ea = r.get('ea') or ''
    m = re.search(r'Model\.([^.)]+)', ea)
    if m:
        return r['brand'] + '|' + m.group(1)
    n = re.sub(r'^(디 올 뉴|더 뉴|올 뉴|뉴|더)\s+', '', r['name'].split(' ', 1)[-1])
    return r['brand'] + '|' + n.split(' ')[0]


for r in cars:
    r['_fam'] = famkey(r)


MASK = set()


def feats(r, extra=()):
    price = num(r.get('price')) or 4000
    w = None if 'weight' in MASK else val(r, 'weight')
    ps = None if 'ps' in MASK else val(r, 'ps')
    f = [math.log(price), r['_ty'],
         num(r.get('len')) or 4600, num(r.get('wid')) or 1850, num(r.get('hei')) or 1550, num(r.get('wb')) or 2750,
         w or 1700, ps or 200, (None if 'tq' in MASK else val(r, 'tq')) or 30, num(r.get('cc')) or 0,
         1 if r.get('drive') == 'AWD' else 0, 1 if r.get('perf') else 0, 1 if r.get('origin') == '수입' else 0,
         1 if r['brand'] in PREMIUM else 0]
    f += [1 if r.get('body') == b else 0 for b in BODIES]
    f += [1 if r.get('powertrain') == p else 0 for p in PTS]
    for e in extra:
        f.append(e(r))
    return f


def gbr():
    return GradientBoostingRegressor(n_estimators=300, max_depth=3, learning_rate=0.05, subsample=0.8, random_state=7)


def fit_predict(field, target_ok, transform=None, inverse=None, extra=(), label='제원 기반 예측', clip=None, train_filter=None, pred_filter=None):
    """target_ok(r) 가 참인 차의 field 값으로 학습해 빈칸을 예측."""
    MASK.clear(); MASK.add(field)
    tr = [r for r in cars if num(r.get(field)) is not None and target_ok(r) and (train_filter is None or train_filter(r))]
    X = np.array([feats(r, extra) for r in tr])
    y = np.array([num(r[field]) for r in tr])
    yt = transform(y) if transform else y
    # 교차검증 오차
    errs = []
    for a_, b_ in KFold(5, shuffle=True, random_state=1).split(X):
        m = gbr().fit(X[a_], yt[a_])
        p = m.predict(X[b_])
        p = inverse(p) if inverse else p
        errs.extend(np.abs(p - y[b_]))
    mae = float(np.mean(errs))
    rng = float(np.percentile(y, 90) - np.percentile(y, 10))
    model = gbr().fit(X, yt)
    print(f'{field:10s} 학습 {len(tr):3d}대 · 평균 오차 ±{mae:.2f} (값 범위 10~90% {rng:.1f})')
    META.setdefault(field, [round(mae, 2), len(tr)])
    if REPORT:
        MASK.clear()
        return mae
    for r in cars:
        if num(r.get(field)) is not None and target_ok(r):
            continue
        if pred_filter and not pred_filter(r):
            continue
        p = model.predict(np.array([feats(r, extra)]))[0]
        p = float(inverse(np.array([p]))[0]) if inverse else float(p)
        if clip:
            p = max(clip[0], min(clip[1], p))
        if field in EST[r['id']]:
            continue
        put(r, field, p, f'{label} (오차 약 ±{mae:.1f})', '낮음' if mae / max(rng, 1e-9) > 0.35 else '중간')
    MASK.clear()
    return mae


def sibling(field, ok=lambda r: True, same_pt=True, label='형제차 준용'):
    """같은 모델(엔카 모델 기준)·같은 동력의 다른 트림 실측값을 빌려 옴."""
    groups = {}
    for r in cars:
        if num(r.get(field)) is not None and ok(r):
            groups.setdefault((r['_fam'], r['powertrain'] if same_pt else ''), []).append(r)
    n = 0
    for r in cars:
        if num(r.get(field)) is not None and ok(r):
            continue
        g = groups.get((r['_fam'], r['powertrain'] if same_pt else ''))
        if not g:
            continue
        g = sorted(g, key=lambda x: abs((num(x.get('price')) or 0) - (num(r.get('price')) or 0)))
        put(r, field, num(g[0][field]), f'{label}: {g[0]["name"]}', '중간')
        n += 1
    return n


# ---------------------------------------------------------------- 1) 기본 제원 (무게·출력·치수)
for f in ['len', 'wid', 'hei', 'wb']:
    sibling(f, same_pt=False, label='같은 모델 제원')
fit_predict('weight', lambda r: True, label='치수·동력 기반 공차중량 예측', clip=(800, 3500))
fit_predict('ps', lambda r: True, transform=np.log, inverse=np.exp, label='배기량·가격 기반 출력 예측', clip=(60, 1200))
fit_predict('tq', lambda r: True, transform=np.log, inverse=np.exp, label='출력 기반 토크 예측', clip=(8, 120))
for r in cars:
    if num(r.get('pw')) is None:
        w, p = val(r, 'weight'), val(r, 'ps')
        if w and p:
            put(r, 'pw', w / p, '공차중량÷출력 (추정 제원)', '중간')
    if num(r.get('seats')) is None:
        s = 7 if r.get('body') == 'MPV' else 2 if r.get('body') in ('쿠페', '컨버터블') and (num(r.get('len')) or 5000) < 4500 else 5
        put(r, 'seats', s, '차체 형태 기준 추정', '중간')

# ---------------------------------------------------------------- 2) 성능
PW = lambda r: math.log(val(r, 'pw') or 9)
TW = lambda r: (val(r, 'tq') or 30) / (val(r, 'weight') or 1700) * 100
sibling('z100', label='같은 파워트레인 트림 준용')
fit_predict('z100', lambda r: True, transform=np.log, inverse=np.exp, extra=(PW, TW), label='무게 대비 출력·토크·구동 기반 제로백 예측', clip=(2.0, 18))
sibling('brake', label='같은 모델 실측 준용')
fit_predict('brake', lambda r: True, label='무게·가격·성능 기반 제동거리 예측', clip=(32, 46))

# ---------------------------------------------------------------- 3) 정숙성 (신뢰도 '낮음' 대체값은 학습에서 빼고 추정으로 교체)
good_noise = lambda r: r.get('noise_conf') != '낮음'
sibling('dba', ok=good_noise, label='같은 모델 실측 준용')
fit_predict('dba', good_noise, label='가격·동력·차체·연식 기반 실내 소음 예측', clip=(52, 68))
# 정숙 가성비: 같은 가격대 평균 소음 대비 (실측 쌍으로 추세 학습)
pairs = [(math.log(num(r['price'])), num(r['dba']) - num(r['vs_price'])) for r in cars if num(r.get('vs_price')) is not None and num(r.get('dba')) is not None and num(r.get('price'))]
if pairs:
    xs, ys = np.array(pairs).T
    k, b = np.polyfit(xs, ys, 1)
    for r in cars:
        if num(r.get('vs_price')) is not None and good_noise(r):
            continue
        d = val(r, 'dba') if good_noise(r) else (EST[r['id']].get('dba') or [None])[0]
        if d is None or not num(r.get('price')):
            continue
        put(r, 'vs_price', d - (k * math.log(num(r['price'])) + b), '추정 소음 기준 가격대 평균 대비', '낮음')

# ---------------------------------------------------------------- 4) 공간
sibling('trunk', same_pt=False, label='같은 모델 트렁크 준용')
fit_predict('trunk', lambda r: True, label='차체·치수 기반 트렁크 용량 예측', clip=(50, 1200))

# ---------------------------------------------------------------- 5) 효율·세금
sibling('fe', label='같은 파워트레인 연비 준용')
for r in cars:
    if num(r.get('tax')) is None:
        cc = num(r.get('cc')) or 0
        t = 130000 if r['powertrain'] in ('전기', '수소전기') or cc == 0 else cc * (80 if cc <= 1000 else 140 if cc <= 1600 else 200) * 1.3
        put(r, 'tax', t, '배기량 기준 자동차세 계산', '높음')

# ---------------------------------------------------------------- 6) 안전 (형제차 결과 → 브랜드·연식·가격 추정)
def safety_pts(t):
    if not t:
        return None
    parts = []
    m = re.search(r'KNCAP (\d)등급', t)
    if m: parts.append({'1': 10, '2': 7, '3': 4}.get(m.group(1), 2))
    m = re.search(r'Euro NCAP ★(\d)', t)
    if m: parts.append({'5': 10, '4': 7, '3': 4}.get(m.group(1), 2))
    m = re.search(r'IIHS ([^(]+)', t)
    if m: parts.append(10 if re.search(r'\+|PLUS', m.group(1), re.I) else 8)
    m = re.search(r'ANCAP ★(\d)', t)
    if m: parts.append({'5': 9, '4': 6}.get(m.group(1), 3))
    if not parts:
        return None
    parts.sort(reverse=True)
    v = parts[0] + 0.35 * sum(parts[1:])
    if re.search(r'이전 세대|만료', t): v -= 2
    return round(v, 1)


for r in cars:
    r['_sp'] = safety_pts(r.get('safety_text'))
fam_s = {}
for r in cars:
    if r['_sp'] is not None:
        fam_s.setdefault(r['_fam'], []).append(r)
for r in cars:
    if r['_sp'] is None and r['_fam'] in fam_s:
        s = fam_s[r['_fam']][0]
        put(r, 'safety_pts', s['_sp'], f'같은 모델 충돌평가 준용: {s["safety_text"]}', '중간')
tr = [r for r in cars if r['_sp'] is not None]
X = np.array([feats(x) for x in tr]); y = np.array([x['_sp'] for x in tr])
errs = []
for a_, b_ in KFold(5, shuffle=True, random_state=1).split(X):
    errs.extend(np.abs(gbr().fit(X[a_], y[a_]).predict(X[b_]) - y[b_]))
print(f'safety     학습 {len(tr):3d}대 · 평균 오차 ±{np.mean(errs):.2f}')
META['safety_pts'] = [round(float(np.mean(errs)), 2), len(tr)]
if not REPORT:
    m = gbr().fit(X, y)
    for r in cars:
        if r['_sp'] is None and 'safety_pts' not in EST[r['id']]:
            put(r, 'safety_pts', min(13.5, float(m.predict(np.array([feats(r)]))[0])), '충돌평가 없음 · 동급(브랜드·연식·가격) 평균으로 추정', '낮음')

# ---------------------------------------------------------------- 7) 리콜 빈도 (자료 없음 → 브랜드 평균)
rates = {}
for r in cars:
    if num(r.get('rec_rate')) is not None:
        rates.setdefault(r['brand'], []).append(num(r['rec_rate']))
allr = [x for v in rates.values() for x in v]
for r in cars:
    if num(r.get('rec_rate')) is None:
        v = rates.get(r['brand'])
        if v and len(v) >= 3:
            put(r, 'rec_rate', float(np.median(v)), f'리콜 자료 없음 · {r["brand"]} 평균({len(v)}개 모델)', '낮음')
        else:
            put(r, 'rec_rate', float(np.median(allr)), '리콜 자료 없음 · 전체 평균', '낮음')

# ---------------------------------------------------------------- 8) 감가 (엔카 시세 없음 → 브랜드·차급·동력·연식 기반)
for r in cars:
    d = r.get('dep') or {}
    rr = d.get('r') if isinstance(d, dict) else None
    r['_depy'] = round((1 - rr) * 100, 1) if rr and 0.5 < rr < 1.02 else None
tr = [r for r in cars if r['_depy'] is not None]
X = np.array([feats(x) for x in tr]); y = np.array([x['_depy'] for x in tr])
errs = []
for a_, b_ in KFold(5, shuffle=True, random_state=1).split(X):
    errs.extend(np.abs(gbr().fit(X[a_], y[a_]).predict(X[b_]) - y[b_]))
print(f'depy       학습 {len(tr):3d}대 · 평균 오차 ±{np.mean(errs):.2f}%p')
META['depy'] = [round(float(np.mean(errs)), 2), len(tr)]
if not REPORT:
    m = gbr().fit(X, y)
    for r in cars:
        if r['_depy'] is None:
            put(r, 'depy', max(2, float(m.predict(np.array([feats(r)]))[0])), f'시세 자료 부족 · 브랜드·차급·동력 기반 감가 예측 (오차 약 ±{np.mean(errs):.1f}%p)', '낮음')

# ---------------------------------------------------------------- 9) 연비 빈칸 (마지막)
ISEV = lambda r: r.get('powertrain') in ('전기',)
fit_predict('fe', lambda r: True, label='동력·무게 기반 연비 예측', train_filter=lambda r: r.get('fe_unit') == 'km/ℓ', pred_filter=lambda r: not ISEV(r) and r.get('powertrain') != '수소전기')
fit_predict('fe', lambda r: True, label='무게·출력 기반 전비 예측', train_filter=lambda r: r.get('fe_unit') == 'km/kWh', pred_filter=ISEV)
for r in cars:
    if 'fe' in EST[r['id']] and not r.get('fe_unit'):
        EST[r['id']]['fe_unit'] = ['km/kWh' if ISEV(r) else 'km/ℓ', '', '']

# ---------------------------------------------------------------- 10) 거주성: 2열 여유 지수
def cabin(r):
    wb, wid, hei, ln = val(r, 'wb'), val(r, 'wid'), val(r, 'hei'), val(r, 'len')
    if not (wb and wid and hei):
        return None
    body, pt = r.get('body'), r.get('powertrain')
    # 실내 길이 ≈ 휠베이스 중심, 머리공간 ≈ 전고, 어깨 ≈ 전폭
    idx = 0.62 * (wb - 2700) / 150 + 0.2 * (wid - 1850) / 60 + 0.18 * (hei - 1550) / 120
    if pt in ('전기', '수소전기') and wb >= 2700:
        idx += 0.35      # 전용 플랫폼 평평한 바닥(센터 터널 없음)
    if body == 'MPV':
        idx += 0.6
    if body in ('쿠페', '컨버터블'):
        idx -= 0.9
    if body == '픽업':
        idx -= 0.4       # 휠베이스가 길어도 적재함 몫
    seats = val(r, 'seats') or 5
    if seats <= 2:
        idx -= 2.5
    elif seats == 4:
        idx -= 0.5
    elif seats >= 7 and body != 'MPV':
        idx += 0.15      # 3열 SUV: 2열 슬라이딩 여유
    return round(50 + 12 * idx, 1)


for r in cars:
    c = cabin(r)
    if c is not None:
        put(r, 'cabin', c, f'휠베이스 {int(val(r,"wb"))} · 전폭 {int(val(r,"wid"))} · 전고 {int(val(r,"hei"))}mm' + (' · 전기차 평평한 바닥' if r.get('powertrain') in ('전기', '수소전기') and val(r, 'wb') >= 2700 else '') + f' · {int(val(r,"seats"))}인승', '계산')

# ---------------------------------------------------------------- 11) 최신성 (에이징 커브)
PLEOS = [r'더 뉴 그랜저', r'디 올 뉴 아반떼', r'디 올 뉴 투싼']
for r in cars:
    y = r['_ty']; age = NOWY - y
    price = num(r.get('price')) or 4000
    brand, pt, name = r['brand'], r.get('powertrain'), r['name']
    hmg = brand in ('현대', '기아', '제네시스')
    ev = pt in ('전기', '수소전기')
    notes_i, notes_a = [], []
    # 인포테인먼트: 세대 연식 + 전기차 OTA + 브랜드 최신 시스템
    info = 30 + (y - 2014) * 5
    if ev: info += 8; notes_i.append('전기차 OTA')
    if brand == '테슬라': info += 15; notes_i.append('테슬라 OTA·대화면')
    if any(re.search(p, name) for p in PLEOS) and not r.get('legend') and not r.get('gyears'):
        info += 18; notes_i.append('플레오스 커넥트')
    elif hmg and y >= 2023 and price >= 3000: info += 6; notes_i.append('ccNC')
    if brand in ('벤츠', 'BMW', '아우디', '볼보', '폴스타', 'BYD', '지커') and y >= 2021: info += 5
    # 주행보조
    adas = 20 + (y - 2014) * 5 + (8 if price >= 4000 else 0) + (6 if price >= 7000 else 0)
    if hmg and y >= 2021 and price >= 3000: adas += 8; notes_a.append('고속도로 주행보조2급')
    if brand == '테슬라':
        if re.search(r'모델 S|모델 X|사이버트럭', name):
            adas += 30; notes_a.append('FSD(감독형) 국내 지원')
        else:
            adas += 15; notes_a.append('오토파일럿 기본(국내 판매 중국산은 FSD 미지원)')
    if brand in ('볼보', '벤츠', 'BMW', '제네시스') and y >= 2020: adas += 4
    # 편의사양: 가격대 + 연식
    conv = 20 + 22 * math.log(price / 2000, 2) + (y - 2014) * 2.5
    put(r, 'tinfo', max(5, min(100, info)), f'{y}년 세대/부분변경 기준' + (' · ' + ', '.join(notes_i) if notes_i else ''), '중간' if notes_i else '낮음')
    put(r, 'tadas', max(5, min(100, adas)), f'{y}년 세대 · 가격대 기준' + (' · ' + ', '.join(notes_a) if notes_a else ''), '중간' if notes_a else '낮음')
    put(r, 'tconv', max(5, min(100, conv)), f'가격대 {int(price):,}만 원 · {y}년 세대 기준 (통풍시트·선루프·HUD 등 보급률)', '낮음')
    put(r, 'tage', age, f'{y}년 세대/부분변경 → {age}년 차', EST[r['id']]['ty'][2])

if REPORT:
    sys.exit()

# ---------------------------------------------------------------- 저장
out = {k: v for k, v in EST.items() if v}
out['_meta'] = META
blob = 'window.__EST=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';'
if 'window.__EST=' in src:
    i = src.index('window.__EST=')
    j = src.index(';', i + 13)
    # __EST 는 한 줄 JSON — 끝 세미콜론 찾기(JSON 안의 ; 를 피하려고 디코더로 길이 계산)
    _, ln = json.JSONDecoder().raw_decode(src[i + len('window.__EST='):])
    j = i + len('window.__EST=') + ln + 1
    src = src[:i] + blob + src[j:]
else:
    k = a + end
    src = src[:k] + ';' + blob[:-1] + src[k:] if src[k] != ';' else src[:k + 1] + blob + src[k + 1:]
open(HTML, 'w', encoding='utf-8').write(src)
cnt = {}
for v in out.values():
    for f in v:
        cnt[f] = cnt.get(f, 0) + 1
print('추정값 저장:', dict(sorted(cnt.items(), key=lambda x: -x[1])))
