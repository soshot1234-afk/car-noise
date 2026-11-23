#!/usr/bin/env python3
"""2026-11-23 차 데이터 최신화 반영

data/다나와_보강_1123.csv  — 다나와 현행 판매차 제원·가격표(2026.11.23 수집)와 짝을 맞춘 결과
data/해외자료_보강_1123.csv — 해외 실측·제조사(해외) 발표 값

규칙
  - 가격: 다나와 값으로 바꾸고 price_src(출처 URL)·price_date 남김
  - 나머지 항목: 우리 데이터가 비어 있을 때만 채움 (몇 대는 명백히 틀린 무게·길이·출력을 고침)
  - 제로백: z100_src = '제조사 발표' (다나와 제원표) 또는 해외 자료 근거 문구, z100_url = 출처
  - 채운 항목은 fill_src = {항목: 출처 URL} 에 기록

  python3 tools/cardata/refresh_1123.py
"""
import csv, json, os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
HTML = os.path.join(ROOT, 'index.html')
TRIMS = os.path.join(ROOT, 'trims.json')
DATE = '2026-11-23'

src = open(HTML, encoding='utf-8').read()
key = 'window.__CARS='
a = src.index(key) + len(key)
cars, end = json.JSONDecoder().raw_decode(src[a:])
by = {c['id']: c for c in cars}

def num(v):
    f = float(v)
    return int(f) if f.is_integer() else f

n = 0
for row in csv.DictReader(open(os.path.join(ROOT, 'data', '다나와_보강_1123.csv'), encoding='utf-8-sig')):
    c = by[row['id']]; k = row['항목']; v = num(row['새 값']); url = row['출처']
    if k == 'price':
        c['price_old'] = c.get('price'); c['price'] = v; c['price_src'] = url; c['price_date'] = DATE
    else:
        c[k] = v
        c.setdefault('fill_src', {})[k] = url
        if k == 'z100':
            c['z100_src'] = '제조사 발표'; c['z100_url'] = url
        if k == 'weight':
            c['weight_src'] = '다나와 제원'
    n += 1

for row in csv.DictReader(open(os.path.join(ROOT, 'data', '해외자료_보강_1123.csv'), encoding='utf-8-sig')):
    c = by[row['id']]; k = row['항목']
    c[k] = num(row['새 값'])
    if k == 'z100':
        c['z100_src'] = row['근거']; c['z100_url'] = row['출처']
    c.setdefault('fill_src', {})[k] = row['출처']
    n += 1

# 디 올 뉴 투싼: 카동 가격표에 아직 없어 다나와 가격표로 트림 목록을 만든다 (spec_src = dn:4757)
T = json.load(open(TRIMS, encoding='utf-8'))
def lineup(name, trims, fe):
    return {'n': name, 'y': '2027년형', 'e': fe, 't': [{'n': t, 'p': p, 'i': '', 'o': []} for t, p in trims]}
T['dn4757'] = {'n': '디 올 뉴 투싼', 'src': 'https://auto.danawa.com/auto/?Work=model&Model=4757&Tab=price', 'l': [
    lineup('가솔린 터보 1.6', [('H-Pick 2WD', 31400000), ('H-Pick 4WD', 33800000), ('익스클루시브 2WD', 35300000), ('익스클루시브 4WD', 37700000),
                           ('XRT 2WD', 36800000), ('XRT 4WD', 39200000), ('인스퍼레이션 2WD', 37900000), ('인스퍼레이션 4WD', 40300000)], '휘발유 10.3~12.2㎞/ℓ'),
    lineup('가솔린 터보 1.6 하이브리드', [('H-Pick 2WD', 36150000), ('H-Pick 4WD', 38550000), ('익스클루시브 2WD', 39900000), ('익스클루시브 4WD', 42300000),
                                  ('XRT 2WD', 41650000), ('XRT 4WD', 44050000), ('인스퍼레이션 2WD', 42700000), ('인스퍼레이션 4WD', 45100000)], '휘발유 14.3~17.4㎞/ℓ'),
], 'd': {}}
for cid in ('dom101', 'dom102'):
    by[cid]['spec_src'] = 'dn:4757'
    by[cid]['spec_ver'] = '다나와 제원·가격표(2026.11.23)'
# 가격이 바뀐 차: 같은 값이던 가격표 트림도 함께 바꿈 (한 화면에서 값이 엇갈리지 않게)
for c in cars:
    if c.get('price_date') == DATE and str(c.get('spec_src', '')).startswith('cd:'):
        t = T.get(c['spec_src'][3:])
        for l in (t or {}).get('l', []):
            for x in l['t']:
                if x['p'] and abs(x['p'] - c['price_old'] * 10000) < 5000:
                    x['p'] = int(round(c['price'] * 10000))
json.dump(T, open(TRIMS, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))

out = json.dumps(cars, ensure_ascii=False, separators=(',', ':'))
open(HTML, 'w', encoding='utf-8').write(src[:a] + out + src[a + end:])
print('반영', n, '건')
