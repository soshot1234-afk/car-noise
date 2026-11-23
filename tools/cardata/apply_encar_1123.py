#!/usr/bin/env python3
"""2026-11-23 엔카 중고 시세 반영 — data/엔카_시세_1123.csv (tools/cardata/encar_1123.js 로 만든 값)
used_price·used_n·used_years·retention(=중고/신차×100) 갱신, used_note·used_src·used_date 남김. 연식별 그래프(uy)는 그대로.
  python3 tools/cardata/apply_encar_1123.py
"""
import csv, json, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
HTML = os.path.join(ROOT, 'index.html')
src = open(HTML, encoding='utf-8').read(); key = 'window.__CARS='; a = src.index(key) + len(key)
cars, end = json.JSONDecoder().raw_decode(src[a:]); by = {c['id']: c for c in cars}
n = 0
for r in csv.DictReader(open(os.path.join(ROOT, 'data', '엔카_시세_1123.csv'), encoding='utf-8-sig')):
    c = by[r['id']]; v = int(r['새 시세'])
    c['used_price'] = v; c['used_n'] = int(r['새 매물수']); c['used_years'] = r['연식']; c['used_status'] = '시세'
    if c.get('price'): c['retention'] = round(v / c['price'] * 100)
    c['used_note'] = '엔카 2026.11.23, 주행 3~7만km 중간값'; c['used_src'] = 'https://www.encar.com'; c['used_date'] = '2026-11-23'
    n += 1
open(HTML, 'w', encoding='utf-8').write(src[:a] + json.dumps(cars, ensure_ascii=False, separators=(',', ':')) + src[a + end:])
print('반영', n, '대')
