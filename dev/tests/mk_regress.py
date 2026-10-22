"""python3 _tests/mk_regress.py -> chapter 1-3 regression specs on the current build (legend code included):
  t_rg1_<starter>.json  chapter 1 from a new game (bot.js + story.js)              -> _tests/rg1_<starter>.json
  t_rg2_<starter>.json  chapter 2 from a finished chapter 1 (bot.js + story2.js)   -> _tests/rg2_<starter>.json
  t_rg3_<tag>.json      chapter 3 from the real chapter-2 saves (mk_story3.py plans) -> _tests/rg3_<tag>.json, _saves/rg3_<tag>.json
  t_rg3_units.json      the 79 chapter-3 unit checks (units3.js)                    -> _tests/rg3_units.json
The chapter-3 runs write their end saves to _saves/rg3_*.json so the pre-legend ch3_*.json saves used by the legend tests
stay untouched."""
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
src = lambda f: open(os.path.join(HERE, f), encoding='utf-8').read()
out = []
for st in ['daram', 'bulguri', 'muldal']:
    run1 = ("(async()=>{ try { window.__R = await BOT.run(window.__STARTER||'daram'); } catch(e) { window.__R = {error: String(e && e.message || e), snap: BOT.snapshot(), log: BOT.log.slice(-8)}; } return 1; })(), 'started'")
    spec = {'viewport': [1100, 900], 'speed': 12, 'maxlogs': 300, 'init': "window.__STARTER='%s';" % st,
            'steps': [['wait', 1500], ['js', src('bot.js')], ['js', src('story.js')], ['js', run1], ['waitfor', 'window.__R', 1800000],
                      ['dump', 'JSON.stringify(window.__R)', '_tests/rg1_%s.json' % st]]}
    json.dump(spec, open(os.path.join(HERE, 't_rg1_%s.json' % st), 'w', encoding='utf-8'), ensure_ascii=False); out.append('t_rg1_%s.json' % st)
    run2 = ("(async()=>{ try { window.__R = await BOT.run2(window.__STARTER||'daram'); } catch(e) { window.__R = {error: String(e && e.message || e), snap: BOT.snapshot(), log: BOT.log.slice(-10), steps: BOT.R && BOT.R.steps, stats: BOT.stats}; console.warn('FAIL ' + JSON.stringify(window.__R)); } })(); 'started'")
    spec = {'viewport': [1100, 900], 'speed': 12, 'maxlogs': 300, 'init': "window.__STARTER='%s';" % st,
            'steps': [['wait', 1500], ['waitfor', "typeof G.titlePick === 'function'", 15000], ['js', "G.titlePick = () => {}; 'title off'"],
                      ['js', src('bot.js')], ['js', src('story2.js')], ['js', run2], ['waitfor', 'window.__R', 2400000],
                      ['dump', 'JSON.stringify(window.__R)', '_tests/rg2_%s.json' % st], ['dump', 'JSON.stringify(G.S)', '_saves/rg2_%s.json' % st]]}
    json.dump(spec, open(os.path.join(HERE, 't_rg2_%s.json' % st), 'w', encoding='utf-8'), ensure_ascii=False); out.append('t_rg2_%s.json' % st)
# chapter 3: the same plans as mk_story3.py, with the end saves kept apart
subprocess.run([sys.executable, os.path.join(HERE, 'mk_story3.py')], check=True, stdout=subprocess.DEVNULL)
for tag in ['daram', 'bulguri', 'muldal', 'daram_zero', 'muldal_old']:
    s = json.load(open(os.path.join(HERE, 't_story3_%s.json' % tag), encoding='utf-8'))
    for stp in s['steps']:
        if stp[0] == 'dump': stp[2] = stp[2].replace('_tests/r3_', '_tests/rg3_').replace('_saves/ch3_', '_saves/rg3_')
        if stp[0] == 'shot': stp[1] = 'rg3_' + tag
    assert not any(stp[0] == 'dump' and 'ch3_' in stp[2] for stp in s['steps'])
    json.dump(s, open(os.path.join(HERE, 't_rg3_%s.json' % tag), 'w', encoding='utf-8'), ensure_ascii=False); out.append('t_rg3_%s.json' % tag)
subprocess.run([sys.executable, os.path.join(HERE, 'mk_units3.py')], check=True, stdout=subprocess.DEVNULL)
s = json.load(open(os.path.join(HERE, 't_ch3_units.json'), encoding='utf-8'))
for stp in s['steps']:
    if stp[0] == 'dump': stp[2] = '_tests/rg3_units.json'
json.dump(s, open(os.path.join(HERE, 't_rg3_units.json'), 'w', encoding='utf-8'), ensure_ascii=False); out.append('t_rg3_units.json')
print('\n'.join(out))
