"""python3 _tests/report3.py -> markdown tables from the chapter-3 bot results (_tests/r3_*.json), for docs."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
J = lambda f: json.load(open(os.path.join(HERE, f), encoding='utf-8')) if os.path.exists(os.path.join(HERE, f)) else None
NAMES = {'daram': '모스코(풀)', 'bulguri': '탄뿔(불)', 'muldal': '방울뚱(물)'}
KO = {'sumaek': '숲맥', 'hwasan': '화산양', 'neoul': '너울뚱', 'padodal': '물결뚱', 'haepum': '해품범', 'pomal': '포말이', 'teoneolgup': '터널굽',
      'deungbullyeong': '등불령', 'jabukhwan': '자북환', 'nachimdol': '나침돌', 'hwaguri': '불뿔', 'daramsup': '잎맥'}
def team(s):
    out = []
    for p in s.replace(',', ' ').split():
        bits = p.split(':')
        out.append(f"{KO.get(bits[0], bits[0])} {bits[1]}" if len(bits) > 1 else p)
    return ' · '.join(out)
def step_party(r, name):
    for s in r['steps']:
        if s[0].startswith(name): return team(s[2])
    return '-'
lines = []
lines.append('| 스타팅 | 3장 시작 팀 | 3장에서 잡은 동료 | R13 → M08 도착 | 5관장 하진 | 6관장 규호 | R18 도착 | 트레이너전 패배 | 전투 중 회복약 · 상태약 | 전투 사이 무료 회복* | 산 물건 |')
lines.append('|---|---|---|---|---|---|---|---|---|---|---|')
for st in ['daram', 'bulguri', 'muldal']:
    r = J('r3_%s.json' % st)
    if not r: lines.append(f'| {NAMES[st]} | (결과 없음) |'); continue
    if r.get('error'): lines.append(f"| {NAMES[st]} | 실패: {r['error'][:80]} |"); continue
    S = r['stats']
    caught = ', '.join(KO.get(c, c) for c in S.get('caught', [])) or '없음'
    g5 = f"{team(S.get('badge5_lv', ''))}, {S.get('badge5_tries', '?')}번째 도전에 승리"
    g6 = f"{team(S.get('badge6_lv', ''))}, {S.get('badge6_tries', '?')}번째 도전에 승리"
    lines.append(f"| {NAMES[st]} | {team(' '.join(r['before']['party']))} | {caught} | {step_party(r, 'R14')} | {g5} | {g6} | {step_party(r, 'Q33')} | {S.get('losses', 0)} | {S.get('potions', 0)} · {S.get('cures', 0)} | {S.get('topups', 0)} | {S.get('bought', 0)} |")
print('\n'.join(lines))
print()
print('| 스타팅 | 배지 | 지도 | 도감(포획) | 선택 의뢰 | 저장 코드 왕복 | 대여 동료의 도감 상태 | 조사증표 | 교본 |')
print('|---|---|---|---|---|---|---|---|---|')
for st in ['daram', 'bulguri', 'muldal']:
    r = J('r3_%s.json' % st)
    if not r or r.get('error'): continue
    side = r.get('side', {})
    ok = sum(1 for v in side.values() if v == 'ok')
    fails = [k + ': ' + v for k, v in side.items() if v != 'ok']
    loan = ', '.join(f"{KO.get(k, k)} {('잡음' if v == 'caught' else '봄' if v == 'seen' else '미등록')}" for k, v in (r.get('dexLoan') or {}).items() if k in (r.get('loans') or {}).values() or k in ('haepum', 'sanbatgom'))
    maps = [m for m in r['maps'] if m in ('map09', 'map10', 'map11', 'map12')]
    print(f"| {NAMES[st]} | {len(r['badges'])}개 | 3장 {len(maps)}/4 | {r['dex']} | {ok}/{len(side)}{(' (' + '; '.join(fails) + ')') if fails else ''} | {r['stats'].get('reloads', 0)}회 | {loan} | {r.get('tokens')} | {', '.join(r.get('tms', []))} |")
print()
for st in ['daram', 'bulguri', 'muldal']:
    r = J('r3_%s.json' % st)
    if not r or r.get('error'): continue
    print(f"- {NAMES[st]} 단계별 팀: " + ' → '.join(f"{s[0]} [{team(s[2])}]" for s in r['steps']))
print()
for v in ['daram_zero', 'muldal_old']:
    r = J('r3_%s.json' % v)
    if not r: print(f'- {v}: (결과 없음)'); continue
    if r.get('error'): print(f"- {v}: 실패 — {r['error'][:200]} / steps: {[s[0] for s in (r.get('steps') or [])]}"); continue
    S = r['stats']
    print(f"- {v}: {len(r['steps'])}단계 완료, 배지 {len(r['badges'])}, 3장 지도 {len([m for m in r['maps'] if m in ('map09','map10','map11','map12')])}/4, 5관장 {team(S.get('badge5_lv',''))} ({S.get('badge5_tries')}번째), 6관장 {team(S.get('badge6_lv',''))} ({S.get('badge6_tries')}번째), 패배 {S.get('losses',0)}, 산 물건 {S.get('bought',0)}, 상점 건너뜀 {S.get('noShop',0)}, 잡은 동료 {S.get('caught', [])}, 대여 {r.get('loans')}, 소지금 {r.get('money')}")
print()
for k in ['g5', 'g6', 'g5hi', 'g6hi']:
    d = J('r3_trial_%s.json' % k)
    if not d: continue
    if isinstance(d, dict): d = d.get('all', [])
    for c in d:
        by = {}
        for t in c['r']: by.setdefault(t['lv'], []).append(t)
        print(f"- trial {k} {c['cfg']}: " + ', '.join(f"Lv{lv} {sum(1 for t in ts if t['won'])}/{len(ts)}" for lv, ts in by.items()))
u = J('r3_units.json')
if u:
    print()
    print(f"units: {len(u.get('pass', []))} pass / {len(u.get('fail', []))} fail")
    for f in u.get('fail', []): print('  FAIL', f)
