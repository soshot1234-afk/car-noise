#!/usr/bin/env python3
"""카스쿼드 차 데이터 통일 — 차종표 만들기·반영

차 하나하나(768대)에 '제조사 · 차종 · 세대 · 세부 · 트림 · 연식' 이름표를 붙인다.
검색(제조사→차종→트림), 랭킹, 차생 그래프, 선수 화면이 모두 이 이름표 하나만 본다.

  python3 tools/cardata/build_names.py            # 차종표.csv 없으면 만들고, 있으면 새 차만 아래에 추가 → index.html 반영
  python3 tools/cardata/build_names.py --check    # 반영 없이 문제만 출력 (차종이 갈라진 곳 등)

고치는 법: data/차종표.csv 를 엑셀·구글 시트로 열어 칸을 고치고 저장 → 위 명령 한 번.
  (id 칸은 절대 고치지 않는다. 같은 차종으로 묶고 싶으면 '차종' 칸 글자를 똑같이 맞춘다.)
"""
import csv, json, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from names_rules import GEN_PAREN, GEN_WORDS, PREFIX, ALIAS, SUBS, SPLIT_BY_GEN

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
HTML = os.path.join(ROOT, 'index.html')
CSV = os.path.join(ROOT, 'data', '차종표.csv')
COLS = ['id', '제조사', '차종', '세대', '세부', '트림', '연식', '이전세대', '원래이름', '출처']
CHECK = '--check' in sys.argv

src = open(HTML, encoding='utf-8').read()
a = src.index('window.__CARS=') + len('window.__CARS=')
cars, end = json.JSONDecoder().raw_decode(src[a:])

# ---- 앱(index.html)의 nlBase와 같은 규칙: 새 차 첫 칸 채우기용
def short_name(n):
    x = ' ' + n + ' '
    for _ in range(3): x = re.sub(r' (더|디|올|뉴|The|All|New)(?= )', ' ', x)
    return re.sub(r'\s+', ' ', x).strip()
def model_key(r):
    out = []
    for w in r['name'].split(' '):
        if re.match(r'^\d', w) and len(out) >= 2: break
        out.append(w)
    return ' '.join(out)
def nl_key(r):
    k = model_key(r); rest = r['name'][len(k):].strip().split(' ')
    return k + ' ' + rest[0] if rest and re.match(r'^\d{1,2}$', rest[0]) else k
def nl_mn(r):
    n = short_name(re.sub('^' + re.escape(r['brand']) + r'\s*', '', nl_key(r))) or r['name']
    w = n.split(' '); return ' '.join(x for i, x in enumerate(w) if i == 0 or x != w[i - 1])
SUBX = re.compile(r'\s+(하이브리드|일렉트릭|수소연료전지|N 라인|N|엣지|스포츠|GT|EV)$')
def nl_base(r):
    n = nl_mn(r); w = n.split(' ')
    if r.get('origin') == '수입':
        if r['brand'] == 'BMW':
            m = re.match(r'^M?(\d)\d{1,2}[a-z]*$', w[0]); return m.group(1) + '시리즈' if m else w[0]
        if r['brand'] == '벤츠':
            x = (w[1] if len(w) > 1 else w[0]) if w[0] == 'AMG' else w[0]
            return x + '클래스' if re.match(r'^[A-Z]$', x) else x
        if w[0] == '모델' and len(w) > 1: return w[0] + ' ' + w[1]
        if len(w) > 1 and ((re.search('[가-힣]', w[0]) and re.match(r'^\d$', w[1])) or w[0] == 'RS'): return w[0] + ' ' + w[1]
        return w[0]
    b = n
    for _ in range(4): b = SUBX.sub('', b)
    return re.sub(r'^(쏘나타) 엣지$', r'\1', b) or n

PT = {'수소전기': '수소', '수소': '수소', '전기': '전기', '하이브리드': '하이브리드', 'PHEV': '플러그인 하이브리드', '디젤': '디젤', 'LPG': 'LPG'}
def guess(r):
    """새 차 → (차종, 세부, 트림) 첫 추정"""
    raw = nl_mn(r)
    base = nl_base(r)
    # 세대 표시 떼기: (GN7) (JA) (신형), 그랜저 IG, LF 쏘나타 …
    b = GEN_PAREN.sub('', base).strip()
    b = PREFIX.sub('', b)
    ws = b.split(' ')
    if len(ws) > 1 and ws[-1] in GEN_WORDS: ws = ws[:-1]
    if len(ws) > 1 and ws[0] in GEN_WORDS: ws = ws[1:]
    b = ' '.join(ws)
    sub = ''
    for s in SUBS:
        if b.endswith(' ' + s): b, sub = b[: -len(s) - 1], s; break
    md = ALIAS.get((r['brand'], b)) or ALIAS.get((r['brand'], base)) or b
    # 세부: 이름에 남은 하위 구분(하이브리드·N·쿠페…) 또는 동력
    rest = GEN_PAREN.sub('', raw)
    if not sub:
        for s in SUBS:
            if re.search(r'(^| )' + re.escape(s) + r'( |$)', rest) and s not in md.split(' '): sub = s; break
    if sub in ('EV', '일렉트릭', '전동화 모델', 'E-Tech') and r.get('powertrain') == '전기': sub = '전기'
    if sub in ('E-Tech',) : sub = '하이브리드'
    if not sub: sub = PT.get(r.get('powertrain'), '가솔린')
    # 트림: 이름에서 차종 뒤 엔진 표기 + 원래 트림
    k = nl_key(r); eng = re.sub(r'^\d세대\s*|^\([^)]*\)\s*', '', GEN_PAREN.sub('', r['name'][len(k):]).strip())
    t = r.get('trim') or ''
    tr = ' · '.join(x for x in [eng, t if t and t != eng and t not in r['name'] else ''] if x) or t or eng or md
    return md, sub, tr

def years(r):
    m = re.search(r'(\d{4})~(\d{4})', r.get('gyears') or r.get('gen') or '')
    return f'{m.group(1)}~{m.group(2)}' if m else ''
def gen_label(r):
    if not r.get('og'): return '현행'
    g = GEN_PAREN.sub('', r.get('gen') or '').strip()
    g = re.sub(r'\s*\d{4}~\d{4}\s*', '', g).strip()
    return g or '이전 세대'
def src_url(r):
    s = str(r.get('spec_src') or '')
    return s

# ---- 차종표 읽기 / 만들기
rows = {}
if os.path.exists(CSV):
    with open(CSV, encoding='utf-8-sig') as f:
        for x in csv.DictReader(f): rows[x['id']] = x
new = 0
for r in cars:
    if r['id'] in rows: continue
    md, sub, tr = guess(r)
    gl = gen_label(r) + ' ' + (r['name'] if r['brand'] == '랜드로버' else '')
    for w in SPLIT_BY_GEN:
        if re.search(r'(^| )' + w + r'( |$)', gl) and w not in md: md = (md + ' ' + w) if w != '컨트리맨' else '컨트리맨'
    rows[r['id']] = {'id': r['id'], '제조사': r['brand'], '차종': md, '세대': gen_label(r), '세부': sub, '트림': tr,
                     '연식': years(r), '이전세대': 'Y' if r.get('og') else '', '원래이름': r['name'], '출처': src_url(r)}
    new += 1
gone = [i for i in rows if i not in {r['id'] for r in cars}]

# ---- 점검: 같은 제조사 안에서 차종 이름이 비슷한데 갈라진 곳
def norm(s): return re.sub(r'[\s\-()·]', '', s).lower()
from collections import defaultdict
fam = defaultdict(set)
for x in rows.values(): fam[(x['제조사'], norm(x['차종']))].add(x['차종'])
warn = [(k[0], sorted(v)) for k, v in fam.items() if len(v) > 1]
models = defaultdict(int)
for x in rows.values(): models[(x['제조사'], x['차종'])] += 1
print(f'차 {len(cars)}대 · 차종 {len(models)}개 · 새로 추가 {new}행 · 표에만 있는 id {len(gone)}개')
for b, v in warn: print('  ! 띄어쓰기만 다른 차종:', b, v)
if CHECK: sys.exit(0)

os.makedirs(os.path.dirname(CSV), exist_ok=True)
order = {r['id']: i for i, r in enumerate(cars)}
with open(CSV, 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.DictWriter(f, fieldnames=COLS); w.writeheader()
    for x in sorted(rows.values(), key=lambda x: (x['제조사'], x['차종'], x['이전세대'], x['세부'], order.get(x['id'], 9e9))):
        w.writerow({c: x.get(c, '') for c in COLS})

# ---- index.html 반영: 차마다 mk(제조사) md(차종) gn(세대) vr(세부) tr(트림) yr(연식)
for r in cars:
    x = rows[r['id']]
    r['mk'], r['md'], r['gn'], r['vr'], r['tr'] = x['제조사'], x['차종'], x['세대'], x['세부'], x['트림']
    if x['연식']: r['yr'] = x['연식']
    else: r.pop('yr', None)
out = src[:a] + json.dumps(cars, ensure_ascii=False, separators=(',', ':')) + src[a + end:]
open(HTML, 'w', encoding='utf-8').write(out)
print('index.html 반영 완료')
