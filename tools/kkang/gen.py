#!/usr/bin/env python3
# 깡통봇 예시 답변 생성기 — 카스쿼드 데이터(앱이 계산한 값)만으로 답을 만든다. AI가 숫자를 지어내지 않게, 숫자는 전부 데이터에서.
import json, sys, os, re
H = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(H, 'cars.json'), encoding='utf-8'))
T = json.load(open('os.path.join(os.path.dirname(H), '..', 'trims.json')', encoding='utf-8'))
by = {r['id']: r for r in D}
DATE = '2026.11.17'
SITE = 'https://carsquad.kr/'
G = ['피지컬', '멘탈', '테크닉', '히든', '선수정보']
FUELP = {'가솔린': 1855.5, '하이브리드': 1855.5, '디젤': 1841.88, 'LPG': 1175.61}

def fmt(n): return f'{int(round(n)):,}'
def A(r, k):
    for a in r['attrs']:
        if a[0] == k: return a
    return None
def val(r, k):
    a = A(r, k)
    if not a: return '데이터 없음'
    t = a[3].replace(' (연료+세금)', '').replace('만 원/년', '만 원')
    if a[4] and k == 'safety': return '공식 평가 없음'
    if a[4]: return (t if t.startswith('추정') else '추정 ' + t)
    return t
def short(r): return r['short']
def jo(w, a='은', b='는'):
    c = w.strip()[-1]
    if '가' <= c <= '힣': return w + (a if (ord(c) - 0xAC00) % 28 else b)
    return w + (a if c.lower() in 'lmnr0136789' else b)
def nm(r):
    m = r['model'];
    if m.startswith(r['brand']): m = m[len(r['brand']):].strip()
    for pre in ('디 올 뉴 ', '더 뉴 ', '올 뉴 ', '뉴 '):
        if m.startswith(pre): m = m[len(pre):]
    return m or r['short']
def plink(r): return f"{SITE}#tab=prof&p={r['id']}"
def clink(*rs): return f"{SITE}#tab=cmp&c={','.join(r['id'] for r in rs)}"
def won(m): return (f'{m/10000:.2f}'.rstrip('0').rstrip('.') + '억 원') if m >= 10000 else fmt(m) + '만 원'
def trims(r):
    s = str(r['raw'].get('spec_src') or '')
    t = T.get(s[3:]) if s.startswith('cd:') else None
    if not t: return None
    ps = sorted({x['p'] for l in t['l'] for x in l['t'] if x.get('p')})
    names = {x['p']: x['n'] for l in t['l'] for x in l['t'] if x.get('p')}
    return (ps[0], names[ps[0]], ps[-1], names[ps[-1]]) if ps else None

OUT = []
def add(cat, q, lines, ids, note=''):
    OUT.append({'cat': cat, 'q': q, 'a': '\n'.join(lines), 'ids': ids, 'note': note, 'date': DATE})

# ---------------------------------------------------------------- ① 1:1 비교
PAIRS = [('dom21', 'dom34'), ('dom44', 'dom10'), ('dom99', 'dom44'), ('dom0', 'dom3'), ('dom3', 'dom36'),
         ('dom101', 'dom48'), ('dom102', 'dom49'), ('dom50', 'dom16'), ('dom51', 'dom17'), ('dom95', 'dom50'),
         ('dom18', 'dom52'), ('dom46', 'dom12'), ('dom9', 'dom41'), ('dom54', 'dom23'), ('dom27', 'dom60'),
         ('dom69', 'de1'), ('dom74', 'de18'), ('dom93', 'dom46')]
ROWS = [('pricev', '신차 가격'), ('eff', '연비'), ('upkeep', '1년 유지비(1.5만km·기름값+세금)'), ('quiet', '실내 소음'),
        ('resale', '감가'), ('safety', '안전'), ('size', '크기')]
for a, b in PAIRS:
    x, y = by[a], by[b]
    L = [f'[신차 기준] {short(x)} vs {short(y)}', '']
    L.append(f"• 종합 능력치(OVR): {x['ovr']} vs {y['ovr']}")
    for k, lb in ROWS:
        L.append(f'• {lb}: {val(x, k)} / {val(y, k)}')
    wa = sum(1 for g in G if x['groups'].get(g) is not None and y['groups'].get(g) is not None and x['groups'][g] > y['groups'][g] + .25)
    wb = sum(1 for g in G if x['groups'].get(g) is not None and y['groups'].get(g) is not None and y['groups'][g] > x['groups'][g] + .25)
    # 각자 가장 크게 앞서는 능력치
    def best(p, q):
        diffs = []
        for t in p['attrs']:
            o = A(q, t[0])
            if o and not t[4] and not o[4] and t[0] not in ('pricev', 'tage'): diffs.append((t[2] - o[2], t[1]))
        diffs.sort(reverse=True)
        return diffs[0][1] if diffs and diffs[0][0] >= 3 else None
    bx, byy = best(x, y), best(y, x)
    d = x['price'] - y['price']
    L.append('')
    one = f"👉 한 줄 정리: 능력치 5개 그룹에서 {nm(x)} {wa}승, {nm(y)} {wb}승" + (f", 비김 {5-wa-wb}" if 5-wa-wb else '') + '.'
    if abs(d) >= 50: one += f" 가격은 {short(y) if d > 0 else short(x)} 쪽이 {fmt(abs(d))}만 원 싸요."
    L.append(one)
    gaps = [f"{jo(nm(r))} '{g}'" for r, g in ((x, bx), (y, byy)) if g]
    if gaps: L.append('   크게 앞서는 능력치: ' + ', '.join(gaps))
    L.append(f'자세히 비교하기 → {clink(x, y)}')
    add('① 1:1 비교', f"{short(x)} vs {short(y)} 비교해줘", L, [a, b])

# 중고 vs 신차 예시
def used_line(r, yr):
    uy = {u[0]: u for u in (r['raw'].get('uy') or [])}
    u = uy.get(yr)
    return (u[2], u[1]) if u else None
u = used_line(by['og46'], 2021)
n = by['dom21']
if u:
    add('① 1:1 비교', '중고 아반떼 2021년식 vs 신차 캐스퍼', [
        f"[중고] {short(by['og46'])} 2021년식 vs [신차] {short(n)}", '',
        f"• 가격: 중고 평균 약 {fmt(u[0])}만 원 (엔카 매물 {u[1]}대 평균) / 신차 {fmt(n['price'])}만 원",
        f"• 종합 능력치(OVR): {by['og46']['ovr']} vs {n['ovr']}",
        f"• 연비: {val(by['og46'], 'eff')} / {val(n, 'eff')}",
        f"• 크기: {val(by['og46'], 'size')} / {val(n, 'size')}",
        '', f"👉 한 줄 정리: 비슷한 돈이면 한 체급 큰 준중형 중고냐, 새 경차냐의 고민이에요. 중고는 주행거리·사고 이력에 따라 값이 크게 달라요.",
        f"자세히 비교하기 → {clink(by['og46'], n)}"], ['og46', 'dom21'], '중고 시세는 2026.10 엔카 기준. 시세 갱신 후 다시 만들 것')

# ---------------------------------------------------------------- ② 예산·상황 추천
cur = [r for r in D if not r['og'] and not r['ex'] and r['id'][:3] in ('dom', 'de1', 'oth', 'leg') or (not r['og'] and r['id'].startswith('de'))]
cur = [r for r in D if not r['og'] and not r['ex'] and not r['id'].startswith(('leg', 'f', 'm'))]
def top(f, n=3, key=lambda r: -(r['ovr'] or 0)):
    return sorted([r for r in cur if f(r) and r['ovr']], key=key)[:n]
def rec(cat, q, f, why, n=3, key=None, foot='👉 OVR(종합 능력치) 높은 순이에요. 내 우선순위(연비·공간·가격)가 다르면 추천 탭에서 5문항으로 다시 골라 보세요.'):
    L = [f'[신차 기준] {why}', '']
    rs = top(f, n, key) if key else top(f, n)
    for i, r in enumerate(rs, 1):
        L.append(f"{i}. {short(r)} — {won(r['price'])} · OVR {r['ovr']} · 연비 {val(r, 'eff')}")
    L += ['', foot, f'추천 받기 → {SITE}#tab=wiz']
    add(cat, q, L, [r['id'] for r in rs])
rec('② 예산·상황 추천', '3천만 원 이하 SUV 추천해줘', lambda r: r['body'] == 'SUV' and r['price'] <= 3000, '3,000만 원 이하 SUV 중 종합 능력치 TOP 3')
rec('② 예산·상황 추천', '사회초년생 첫차 뭐가 좋아? (2,500만 원 이하)', lambda r: r['price'] <= 2500 and r['pt'] != '전기', '2,500만 원 이하 신차 중 종합 능력치 TOP 3')
rec('② 예산·상황 추천', '4인 가족 패밀리카 추천 (4~5천만 원)', lambda r: 4000 <= r['price'] <= 5000 and r['body'] in ('SUV', 'RV', 'MPV', '미니밴') and (r['raw'].get('len') or 0) >= 4650, '4,000~5,000만 원, 길이 4.65m 이상 SUV·미니밴 중 종합 능력치 TOP 3')
rec('② 예산·상황 추천', '출퇴근용 하이브리드 추천 (4천만 원 이하)', lambda r: r['pt'] == '하이브리드' and r['price'] <= 4000, '4,000만 원 이하 하이브리드 중 연비 좋은 순 TOP 3', key=lambda r: -(r['raw'].get('fe') or 0), foot='👉 공인 복합연비 높은 순이에요. 출퇴근 거리가 길수록 연비 차이가 크게 벌어져요.')
rec('② 예산·상황 추천', '전기차 입문용 추천 (5천만 원 이하)', lambda r: r['pt'] == '전기' and r['price'] <= 5000, '5,000만 원 이하 전기차 중 종합 능력치 TOP 3 (보조금 전 가격)')

# ---------------------------------------------------------------- ③ 유지비
for cid in ['dom0', 'dom50']:
    r = by[cid]; up = A(r, 'upkeep')
    if up:
        yr = int(up[3].split('만')[0].replace(',', ''))
        add('③ 유지비', f'{short(r)} 한 달 유지비 얼마야?', [
            f'[신차 기준] {short(r)}', '',
            f"• 1년 기름값+자동차세: 약 {fmt(yr)}만 원 → 한 달 약 {fmt(yr/12)}만 원",
            '• 기준: 1년 15,000km, 공인 복합연비, 오피넷 전국 평균 기름값(2026.11.02)',
            '• 빠진 것: 보험료·정비비·주차비 (사람마다 너무 달라서 아직 몰라요)', '',
            f"👉 내 주행거리로 다시 계산 → {plink(r)} (비용 탭)"], [cid])
x, y = by['dom101'], by['dom102']
pg = FUELP['가솔린'] / 12.2; ph = FUELP['가솔린'] / 17.4; diff = y['price'] - x['price']
km = diff * 10000 / (pg - ph)
add('③ 유지비', '하이브리드는 몇 km 타야 이득이야? (투싼 기준)', [
    f'[신차 기준] {short(x)} vs {short(y)}', '',
    f"• 가격 차이: {fmt(diff)}만 원 (하이브리드가 비쌈)",
    f"• 1km당 기름값: 가솔린 약 {pg:.0f}원 / 하이브리드 약 {ph:.0f}원 → 1km마다 {pg-ph:.0f}원 아낌",
    f"• 본전 거리: 약 {fmt(round(km, -3))}km (1년 1.5만km면 약 {km/15000:.1f}년)", '',
    '👉 휘발유 1,855원(오피넷 2026.11.02)·공인 연비 기준이에요. 출퇴근이 길수록, 시내 주행이 많을수록 하이브리드가 빨리 본전을 뽑아요. 중고로 팔 때 값 차이는 빠져 있어요.',
    f'자세히 비교하기 → {clink(x, y)}'], ['dom101', 'dom102'])

# ---------------------------------------------------------------- ④ 감가·중고
r = by['og46']
add('④ 감가·중고', '중고 아반떼(CN7) 연식별 시세 알려줘', [f'[중고] {short(r)}', ''] +
    [f"• {u[0]}년식: 평균 약 {fmt(u[2])}만 원 (매물 {u[1]}대)" for u in (r['raw'].get('uy') or [])] +
    ['', '👉 엔카 매물 평균값이라 주행거리·옵션·사고 이력에 따라 차이가 커요. (2026.10 수집)', f'자세히 → {plink(r)}'], ['og46'], '시세 갱신 후 다시 만들 것')
for cid in ['dom0', 'dom50']:
    r = by[cid]
    m = re.search(r'평균 ([\d.]+)%', A(r, 'resale')[3]); rate = float(m.group(1)) / 100
    left = r['price'] * (1 - rate) ** 3
    add('④ 감가·중고', f'{short(r)} 3년 타면 얼마 남아?', [f'[신차 기준] {short(r)}', '', f"• 감가: {val(r, 'resale')}",
        f"• 그 속도로 3년이면: 신차 {fmt(r['price'])}만 원 → 약 {fmt(round(left, -1))}만 원 (약 {(1-rate)**3*100:.0f}%)", '',
        '👉 같은 세대 중고 매물의 연식별 시세로 계산했어요. 출시 직후 모델은 이전 세대 흐름으로 추정해요.', f'자세히 → {plink(r)}'], [cid])
rs = sorted([r for r in cur if r['body'] == 'SUV' and r['origin'] == '국산' and A(r, 'resale') and not A(r, 'resale')[4] and sum(u[1] for u in (r['raw'].get('uy') or [])) >= 200], key=lambda r: -A(r, 'resale')[2])[:3]
add('④ 감가·중고', '감가 적은 SUV 알려줘', ['[신차 기준] 감가 방어 점수가 높은 국산 SUV TOP 3 (중고 매물 200대 이상만)', ''] +
    [f"{i}. {short(r)} — {val(r, 'resale')}" for i, r in enumerate(rs, 1)] + ['', f'랭킹에서 더 보기 → {SITE}#tab=rank'], [r['id'] for r in rs])

# ---------------------------------------------------------------- ⑤ 조용함·안전·리콜
rs = sorted([r for r in cur if r['body'] == 'SUV' and A(r, 'quiet') and not A(r, 'quiet')[4] and r['price'] <= 5000], key=lambda r: -A(r, 'quiet')[2])[:3]
add('⑤ 조용함·안전·무상점검', '조용한 SUV 추천 (5천만 원 이하)', ['[신차 기준] 실내 소음 실측값이 낮은 SUV TOP 3 (80km/h)', ''] +
    [f"{i}. {short(r)} — {val(r, 'quiet')} · {won(r['price'])}" for i, r in enumerate(rs, 1)] +
    ['', '👉 오토뷰 실측값만 골랐어요(추정치 제외). 타이어·노면에 따라 체감은 달라요.'], [r['id'] for r in rs])
rs = sorted([r for r in cur if r['body'] == 'SUV' and A(r, 'safety') and not A(r, 'safety')[4] and r['price'] <= 4500], key=lambda r: -A(r, 'safety')[2])[:3]
add('⑤ 조용함·안전·무상점검', '안전한 SUV 추천 (4,500만 원 이하)', ['[신차 기준] 충돌 안전 평가가 좋은 SUV TOP 3', ''] +
    [f"{i}. {short(r)} — {val(r, 'safety')}" for i, r in enumerate(rs, 1)] + ['', '👉 KNCAP·Euro NCAP·IIHS 공식 평가를 점수로 바꾼 값이에요.'], [r['id'] for r in rs])
r = by['dom50']
add('⑤ 조용함·안전·무상점검', '쏘렌토 리콜(무상 점검) 많이 했어?', [f'[같은 세대 기준] {short(r)}', '', f"• 무상 점검(리콜) 기록: {val(r, 'durab')}", '',
    '👉 한국교통안전공단 공개자료(2025.12 기준)예요. 리콜은 제조사가 결함을 찾아 무상으로 고쳐 주는 거라, 횟수만으로 나쁜 차라고 단정할 수는 없어요.',
    '내 차가 대상인지 확인 → 자동차리콜센터(car.go.kr)에 차량번호 입력', f'자세히 → {plink(r)}'], ['dom50'])

# ---------------------------------------------------------------- ⑥ 갈아타기
x, y = by['dom93'], by['dom46']
add('⑥ 갈아타기', '아르카나에서 니로로 바꾸면 얼마 들어?', [f'[내 차 → 신차] {short(x)} → {short(y)}', '',
    '깡통봇은 내 차 연식·주행거리를 몰라서 정확한 계산은 못 해요 🥲 대신 갈아타기 계산기에 넣으면 바로 나와요:',
    '1) 니로 페이지 → 비용 탭 → "이 차로 갈아타면"', '2) 지금 차·연식·주행거리 입력', '3) 내 차 예상 시세, 추가로 낼 돈, 연료비 차이까지 계산',
    f'계산하러 가기 → {plink(y)}'], ['dom93', 'dom46'])

# ---------------------------------------------------------------- ⑦ 사용법
for q, L in [
    ('OVR이 뭐예요?', ['OVR은 축구 게임처럼 차의 종합 능력치(1~99)예요.', '가속·연비·정숙성·안전·감가 등 20여 개 능력치를 1~20점으로 매기고, 5개 그룹(피지컬·멘탈·테크닉·히든·선수정보)으로 묶어 합친 점수예요.', '실측·공식 값이 없는 칸은 추정치로 채우고 비중을 낮춰요.', f'계산 방법 자세히 → {SITE}#tab=how']),
    ('부상빈도가 뭐예요?', ['리콜(무상 점검) 기록이에요. 같은 세대 차가 1년에 몇 번꼴로 무상 점검을 했는지로 점수를 매겨요.', '점수가 높을수록 기록이 적다는 뜻이에요. 출처는 한국교통안전공단 공개자료(2025.12 기준)예요.']),
    ('(추정)은 무슨 뜻이에요?', ['실측값이나 제조사 공식 값을 못 찾은 칸을, 비슷한 차 데이터로 계산해 채운 값이에요.', '그래서 숫자 옆에 꼭 (추정)을 붙이고, 종합 점수에는 낮은 비중으로만 넣어요.', '정확한 값을 아시면 차 페이지의 "오류 제보"로 알려 주세요!']),
    ('신차 가격 깡통이랑 풀옵 차이 얼마야? (아반떼)', None),
]:
    if L is None:
        r = by['dom0']; t = trims(r)
        L = [f'[신차] {short(r)}', '', f"• 가장 싼 트림(깡통): {t[1]} {fmt(t[0]/10000)}만 원", f"• 가장 비싼 트림: {t[3]} {fmt(t[2]/10000)}만 원",
             f"• 차이: {fmt((t[2]-t[0])/10000)}만 원 (선택 옵션 빼고)", '', '👉 다나와 신차 가격표 기준이에요. 옵션까지 다 넣은 진짜 풀옵 가격은 아직 몰라요.', f'트림별 가격 → {plink(r)} (비용 탭)']
        add('② 예산·상황 추천', '신차 아반떼 깡통이랑 풀옵 차이 얼마야?', L, ['dom0'])
        continue
    add('⑦ 사이트 사용법', q, L, [])

# ---------------------------------------------------------------- ⑧ 못 하는 것 (정해진 안내)
for q, L in [
    ('이번 달 할인 얼마야?', ['그건 아직 몰라요 🥲 할인은 매달, 대리점마다 바뀌어서 깡통봇이 따라가기 어려워요.', '대신 매주 화요일 인스타 "이번 주 차 소식"에 제조사 공식 할인을 정리해 올려요 → @car_squad2026']),
    ('OO 출시 언제야? 가격 얼마 나와?', ['출시 전 차는 다루지 않아요. 확인 안 된 소문은 안 옮기는 게 카스쿼드 원칙이에요.', '공식 출시되면 바로 사이트에 추가할게요!']),
    ('견적 내줘 / 어디서 사야 싸?', ['견적·대리점 연결은 못 해요. 카스쿼드는 비교만 하는 곳이라, 특정 판매처를 추천하지 않아요.']),
    ('보험료 얼마 나와?', ['보험료는 나이·경력·사고 이력마다 너무 달라서 몰라요 🥲 유지비 계산에서도 빠져 있어요.']),
]:
    add('⑧ 못 하는 것(정해진 안내)', q, L, [])

json.dump(OUT, open(os.path.join(H, 'answers.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(OUT))
for o in OUT: print('\n=====', o['cat'], '|', o['q'], '\n' + o['a'])
